from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel
from datetime import datetime, timezone
from app.database import get_db
from app.middleware.auth_middleware import require_university
from app.services.hashing import hash_pdf
from app.services.encryption import encrypt_pdf, encrypt_cid
from app.services.ipfs import upload_to_ipfs
from app.services.qr import generate_qr
from app.services.blockchain import verify_transaction_receipt

router = APIRouter()

class TxConfirm(BaseModel):
    tx_hash: str
#pydantic model to validate the tx_hash that comes from the frontend after MetaMask signing

@router.post("")
#this endpoint is called by frontend when user clicks issue certificate button and does everything until returning data to frontend except blockchain tx
async def create_certificate(
    student_name: str = Form(...),
    major: str = Form(...),
    graduation_date: str = Form(...),
    pdf: UploadFile = File(...),
    #form and file are used because we upload a file so cant use JSON with file uploads it is called multipart/form-data
    current_user: dict = Depends(require_university) 
    #it uses the auth middleware to check if the user is authenticated and has the role of university
    ):
    db = get_db()
    if current_user.get("status") != "Active":
        raise HTTPException(status_code=403, detail="University is not active")
    #only active universities can issue certs
    if not current_user.get("wallet_address"):
        raise HTTPException(status_code=400, detail="Wallet address not registered — connect wallet first")
    #check if the university has a wallet address to sign the certificate

    pdf_bytes = await pdf.read()
    #await is used because uploadfile.read() method is async to read the uploaded file into memory
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="PDF file is empty")

    cert_hash = hash_pdf(pdf_bytes)
    #sha256 hash of the pdf data
    existing = await db.certificates.find_one({"hashed_certificate": cert_hash})
    if existing:
        raise HTTPException(status_code=400, detail="Certificate with this exact PDF already exists")
    #check here before wasting gas on a tx that would fail on chain too

    encrypted_pdf = encrypt_pdf(pdf_bytes)
    #aes-256-gcm encrypt raw pdf to be sent to ipfs to be stored and a cid is returned
    try:
        ipfs_cid = await upload_to_ipfs(encrypted_pdf)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"IPFS upload failed: {str(e)}")
    #pinata is external so it can fail so system doesnt crash after it

    enc_cid = encrypt_cid(ipfs_cid)
    #encrypt the cid so qr code doesnt expose the ipfs address
    qr_base64 = generate_qr(enc_cid)
    #qr code image as base64 png — printed on physical certificate

    cert_hash_bytes_hex = "0x" + cert_hash
    #0x prefix so frontend knows its hex for the smart contract bytes32 param

    certificate_doc = {
        "student_name": student_name,
        "major": major,
        "graduation_date": graduation_date,
        "university_id": str(current_user["_id"]),
        "hashed_certificate": cert_hash,
        "enc_cid": enc_cid,
        #only encrypted cid stored if backend needs to fetch from ipfs it decrypts this first
        "qr_code": qr_base64,
        "status": "Pending",
        #pending until frontend confirms the blockchain tx
        "issue_date": datetime.now(timezone.utc),
        "tx_hash": None,
        #filled by /confirm endpoint after frontend signs
    }

    result = await db.certificates.insert_one(certificate_doc)
    #return data the frontend needs to call issueCertificate(certHash, encCid) on chain
    return {
        "message": "Certificate prepared sign the transaction onchain to complete issuance",
        "certificate_id": str(result.inserted_id),
        "cert_hash_bytes": cert_hash_bytes_hex,
        "encrypted_cid": enc_cid,
        "qr_code": qr_base64,
    }

@router.post("/{certificate_id}/confirm")
#this endpoint is called by frontend to confirm the blockchain tx after meta mask confirmation prompt and updates mongodb 
async def confirm_certificate(
    certificate_id: str, 
    body: TxConfirm,
    current_user: dict = Depends(require_university)
):
    db = get_db()
    certificate = await db.certificates.find_one({"_id": ObjectId(certificate_id)})
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if certificate["university_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="This certificate belongs to another university")
    if certificate["status"] != "Pending":
        raise HTTPException(status_code=400, detail=f"Certificate is already {certificate['status']}")
    #for prevention of double issuing of same certificate

    try:
        tx_result = await verify_transaction_receipt(body.tx_hash)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    #checks: tx exists, succeeded, and targeted our contract

    if tx_result["from"].lower() != current_user["wallet_address"].lower():
        raise HTTPException(status_code=403, detail="Transaction was not signed by your wallet")
    #signer must match the logged in university's wallet

    await db.certificates.update_one(
        {"_id": ObjectId(certificate_id)},
        {"$set": {
            "status": "Issued",
            "tx_hash": body.tx_hash,
            #save tx hash for audit trail
        }}
    )
    await db.universities.update_one(
        {"_id": current_user["_id"]},
        {"$inc": {"total_certificates": 1}}
        #atomic increment safe even with concurrent confirmations it used to prevent race condition and overwritting
    )

    return {
        "message": "Certificate issued successfully and recorded on blockchain",
        "certificate_id": certificate_id,
        "tx_hash": body.tx_hash,
        "status": "Issued"
    }

@router.get("")
#this endpoint returns all the certificates for a university 
async def list_certificates(current_user: dict = Depends(require_university)):
    db = get_db()
    #only return certs belonging to this university
    certificates = await db.certificates.find(
        {"university_id": str(current_user["_id"])}
    ).to_list(length=100)
    #preventing memory issues when dealing with large databases by taking 100 at time

    for cert in certificates:
        cert["_id"] = str(cert["_id"])
        #objectid to string for json serialization

    return certificates

@router.get("/{certificate_id}")
#this endpoint is used to get a certificate by its id 
async def get_certificate(
    certificate_id: str,
    current_user: dict = Depends(require_university)
):
    db = get_db()
    certificate = await db.certificates.find_one({"_id": ObjectId(certificate_id)})
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if certificate["university_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="This certificate belongs to another university")

    certificate["_id"] = str(certificate["_id"])
    return certificate

@router.put("/{certificate_id}/revoke")
#this endpoint is used to revoke a certificate first step of the process 
async def revoke_certificate(
    certificate_id: str,
    current_user: dict = Depends(require_university)
):
    db = get_db()
    certificate = await db.certificates.find_one({"_id": ObjectId(certificate_id)})
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if certificate["university_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="This certificate belongs to another university")
    if certificate["status"] != "Issued":
        raise HTTPException(status_code=400, detail=f"Cannot revoke — certificate status is {certificate['status']}")
    #can only revoke issued certs

    await db.certificates.update_one(
        {"_id": ObjectId(certificate_id)},
        {"$set": {"status": "PendingRevocation"}}
    )
    #intermediate status to track started but unfinished revocations

    cert_hash_bytes_hex = "0x" + certificate["hashed_certificate"]
    #frontend passes this to revokeCertificate(certHash) on the smart contract
    return {
        "message": "Certificate marked for revocation — sign the transaction on chain to complete",
        "certificate_id": certificate_id,
        "cert_hash_bytes": cert_hash_bytes_hex,
    }

@router.post("/{certificate_id}/revoke/confirm")
#this endpoint is used to confirm the revocation of a certificate second step of the process
async def confirm_revocation(
    certificate_id: str,
    body: TxConfirm,
    current_user: dict = Depends(require_university)
):
    db = get_db()
    certificate = await db.certificates.find_one({"_id": ObjectId(certificate_id)})
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if certificate["university_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="This certificate belongs to another university")
    if certificate["status"] != "PendingRevocation":
        raise HTTPException(status_code=400, detail=f"Certificate is not pending revocation — status is {certificate['status']}")

    try:
        tx_result = await verify_transaction_receipt(body.tx_hash)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if tx_result["from"].lower() != current_user["wallet_address"].lower():
        raise HTTPException(status_code=403, detail="Transaction was not signed by your wallet")

    await db.certificates.update_one(
        {"_id": ObjectId(certificate_id)},
        {"$set": {"status": "Revoked"}}
        #final status no unrevoke function exists in the smart contract
    )

    return {
        "message": "Certificate revoked successfully",
        "certificate_id": certificate_id,
        "tx_hash": body.tx_hash,
        "status": "Revoked"
    }
