from fastapi import APIRouter, HTTPException, UploadFile, File
from app.services.hashing import hash_pdf
from app.services.blockchain import verify_certificate_on_chain
from app.services.qr import decode_qr
from app.services.encryption import decrypt_cid, decrypt_pdf
from app.services.ipfs import fetch_from_ipfs
import base64

router = APIRouter()

@router.get("")
async def health_check():
    #simple endpoint to check if the verify router is mounted and responding
    return {"message": "verify router is working"}

@router.post("/file")
#this endpoint verify a cert by uploading its file
async def verify_by_file(pdf: UploadFile = File(...)):

    pdf_bytes = await pdf.read()

    #read the file store it to pdf bytes
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="PDF file is empty")

    cert_hash = hash_pdf(pdf_bytes)
    #convert cert to hash to verify it
    try:
        result = await verify_certificate_on_chain(cert_hash) #add await to prevent error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain verification failed: {str(e)}")

    return {
        "certificate_hash": cert_hash,
        "status": result["status"],
        "issuer": result["issuer"],
        "timestamp": result["timestamp"],
    }
    #return the cert metadata if it is found on chain


@router.post("/qr")
#this endpoint verify cert by qr reading
async def verify_by_qr(qr_image: UploadFile = File(...)):
    #accepts the QR code as an image file (PNG, JPG, etc.)

    image_bytes = await qr_image.read()
    #read the uploaded QR image into memory

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="QR image file is empty")

    qr_base64 = base64.b64encode(image_bytes).decode("utf-8")
    #convert raw image bytes to base64 string because decode_qr() expects base64 input
    #this matches how QR codes are stored in the certificates collection (qr_code field)

    try:
        encrypted_cid = decode_qr(qr_base64)
        #extract the data embedded in the QR code this is the AES-256-GCM encrypted CID
    except ValueError:
        raise HTTPException(status_code=400, detail="No QR code found in the uploaded image")
    #pyzbar couldn't find a QR code pattern in the image — bad scan, wrong image, etc.
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"QR decode failed: {str(e)}")

    try:
        plain_cid = decrypt_cid(encrypted_cid)
        #reverse the AES-256-GCM encryption to get the original IPFS CID
        #only our backend can do this because the AES key is in our .env
        #this is WHY we encrypt CIDs prevents anyone from going directly to IPFS
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to decrypt CID — QR data is corrupted or tampered")
    #if decryption fails the auth tag doesn't match the data was modified after encryption

    try:
        encrypted_pdf_str = await fetch_from_ipfs(plain_cid)
        #download the encrypted PDF from IPFS using the Pinata gateway
        #what comes back is the base64url-encoded AES-encrypted PDF (exactly what was uploaded during issuance)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch from IPFS: {str(e)}")
    #502 Bad Gateway because the failure is from an external service (Pinata/IPFS), not our backend

    try:
        pdf_bytes = decrypt_pdf(encrypted_pdf_str)
        #reverse the AES-256-GCM encryption to get the original raw PDF bytes
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to decrypt PDF from IPFS")
    #if this fails something went wrong with IPFS storage or the AES key changed since issuance

    cert_hash = hash_pdf(pdf_bytes)
    #hash the decrypted PDF with SHA-256 same deterministic function used during issuance
    #if the PDF on IPFS is untampered, this hash will match what was recorded on the blockchain

    try:
        result = await verify_certificate_on_chain(cert_hash) #same as line 29
        #check the hash against the smart contract free view call
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain verification failed: {str(e)}")

    return {
        "certificate_hash": cert_hash,
        "status": result["status"],
        #VALID / REVOKED / FAKE
        "issuer": result["issuer"],
        "timestamp": result["timestamp"],
     
    }
