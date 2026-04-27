import json                          # to load the ABI JSON file from disk
from pathlib import Path             # to build the file path to the ABI file cleanly
from web3 import Web3                # the main library for interacting with Ethereum/Polygon
from web3.exceptions import ContractLogicError  # raised when a require() fails in the contract
from app.config import settings     


ABI_PATH = Path(__file__).resolve().parent.parent.parent / "contracts" / "TrustChain_ABI.json"
#to load ABI file from contracts folder

with open(ABI_PATH, "r") as f:
    CONTRACT_ABI = json.load(f)
#load abi just once when server starts not every time function called for efficiency

def get_web3() -> Web3:

    w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL))
    # HTTPProvider = connect via HTTP to the RPC node.
    if not w3.is_connected():
        #Ping the node to check if it is reachable
        raise ConnectionError("Cannot connect to Polygon Amoy RPC")
    #raise error if not connected to RPC to prevent sending transaction to void and crash system
    return w3


def get_contract(w3: Web3):
    #return contract instance the object that represents our deployed trustchain contract on chain
    
    return w3.eth.contract(
        address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
        #convert contract address to checksum format
        abi=CONTRACT_ABI
    )

async def register_university_on_chain(wallet_address: str) -> str:
  #to register university wallet address on chain only admin can do it and the tx is signed by admin wallet
    w3 = get_web3()
    contract = get_contract(w3)

    checksummed = Web3.to_checksum_address(wallet_address)
  
    admin_address = Web3.to_checksum_address(settings.ADMIN_WALLET_ADDRESS)
   
    nonce = w3.eth.get_transaction_count(admin_address)
   
    tx = contract.functions.registerUniversity(checksummed).build_transaction({
       #to build the transaction structure to be signed and sent to the blockchain
        "from": admin_address,
       
        "nonce": nonce,
       
        "gas": 100000,#max gas fees that is over the limits 100000 so no transaction will be rejected due to gas fees

        "gasPrice": w3.eth.gas_price,
       
        "chainId": settings.CHAIN_ID
        
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=settings.ADMIN_PRIVATE_KEY)
    #sign the tx with admin private key and return the signed tx
    tx_hash =  w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    #send the signed tx to the blockchain here the tx goes live and cost gas fees from the admin wallet
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    #wait for the tx to be sent and return the receipt
    if receipt.status == 0:
         raise Exception(f"Transaction reverted on-chain: {tx_hash.hex()}")
    #if the tx is not successfull return error

    return tx_hash.hex()
    #return the tx hash to be saved in mongoDB
    

async def issue_certificate_on_chain(
    cert_hash_bytes: bytes,
    encrypted_cid: str,
    university_wallet: str,
    university_private_key: str
) -> str:
    #to issue cert on the chain the uni builds the tx and sign by their private key and send it from there wallet address
    w3 = get_web3()
    contract = get_contract(w3)

    checksummed = Web3.to_checksum_address(university_wallet)

    nonce = w3.eth.get_transaction_count(checksummed)

    tx = contract.functions.issueCertificate(
        cert_hash_bytes,
        encrypted_cid
    ).build_transaction({
        "from": checksummed,
        "nonce": nonce,
        "gas": 100000,
        "gasPrice": w3.eth.gas_price,
        "chainId": settings.CHAIN_ID
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=university_private_key)
    #sign the transaction with the university's private key 
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt.status == 0:
        raise Exception(f"issueCertificate reverted on-chain: {tx_hash.hex()}")
    #status 0 means the require() in the contract failed and return error with the hash of the transaction 

    return tx_hash.hex()
    #return tx hash as hex to be saved in mongodb

async def revoke_certificate_on_chain(
    cert_hash_bytes: bytes,
    university_wallet: str,
    university_private_key: str
) -> str:
    w3 = get_web3()
    contract = get_contract(w3)

    checksummed = Web3.to_checksum_address(university_wallet)

    nonce = w3.eth.get_transaction_count(checksummed)

    tx = contract.functions.revokeCertificate(cert_hash_bytes).build_transaction(
        {
        "from": checksummed,
        "nonce": nonce,
        "gas": 100000,
        "gasPrice": w3.eth.gas_price,
        "chainId": settings.CHAIN_ID
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=university_private_key)

    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt.status == 0:
        raise Exception(f"revokeCertificate reverted on-chain: {tx_hash.hex()}")
        #error based on the require in the solidity code
    return tx_hash.hex()
    #return tx hash for audit trail in MongoDB


async def verify_certificate_on_chain(cert_hash_hex: str) -> dict:
    #to verify certificate on chain with its hash it is free no gas fees required
    w3 = get_web3()
    contract = get_contract(w3)

    cert_hash_bytes = bytes.fromhex(cert_hash_hex.replace("0x", ""))
    #convert the hex string to bytes
    result = contract.functions.verifyCertificate(cert_hash_bytes).call()
    #call verifyCertificate function and return the result
    exists    = result[0]   #bool
    is_revoked = result[1]  #bool
    issuer    = result[2]   #address string
    timestamp = result[3]   #timestamp int

    if not exists:
        return {"status": "FAKE", "issuer": None, "timestamp": None}
        #cert hash not found
    elif is_revoked:
        return {"status": "REVOKED", "issuer": issuer, "timestamp": timestamp}
    #is revoked true so the cert is revoked
    else:
        return {"status": "VALID", "issuer": issuer, "timestamp": timestamp}
    #valid and return its data

async def is_university_registered(wallet_address: str) -> bool:
    #check if university is registered on chain also free no gas fees required
    w3 = get_web3()
    contract = get_contract(w3)

    checksummed = Web3.to_checksum_address(wallet_address)
    #convert the wallet address to checksum format

    return contract.functions.isUniversityRegistered(checksummed).call()
    #call isUniversityRegistered function and return the result
    #bool return values: True if registered, False otherwise

async def get_admin_address() -> str:
    #get admin address from the smart contract 
    #this is also free function 
    #sanity test function
    #call getAdmin function and return the result
    w3 = get_web3()
    contract = get_contract(w3)

    return contract.functions.getAdmin().call()
    #return the admin address string that is set in the constructor of the smart contract

async def verify_transaction_receipt(tx_hash_hex: str) -> dict:
    #called by the /confirm endpoints after frontend signs it and send it to chain we have to verify it

    w3 = get_web3()

    try:
        receipt = w3.eth.get_transaction_receipt(tx_hash_hex)
        #fetch the receipt from the blockchain using the tx hash
        #if the tx doesnt exist yet it will raise an exception
    except Exception:
        raise ValueError("Transaction not found on-chain either invalid hash or not mined yet")
    #transaction not found so return error
    if receipt.status == 0:
        raise ValueError("Transaction was reverted on-chain (failed)")
    #status 0 = the require() in the contract failed, the tx was rejected

    contract_address = Web3.to_checksum_address(settings.CONTRACT_ADDRESS)
    if receipt["to"].lower() != contract_address.lower():
        raise ValueError("Transaction was not sent to the TrustChain contract")
    #security check: make sure the tx was actually calling OUR contract
 
    return {
        "status": "confirmed",
        #the tx was sent to the blockchain and succeeded
        "from": receipt["from"],
        #the wallet address that signed the tx
        "block_number": receipt["blockNumber"],
        "gas_used": receipt["gasUsed"],
        #how much gas the tx actually consumed
    }
