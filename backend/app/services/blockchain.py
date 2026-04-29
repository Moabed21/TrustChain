"""
services/blockchain.py
─────────────────────
Connects the FastAPI backend to the TrustChain smart contract
on Polygon via web3.py.

Architecture:
  Python (web3.py) ──► Polygon RPC ──► TrustChain.sol

Key concepts:
  - "write" functions (registerUniversity, issueCertificate, revokeCertificate)
    require a signed transaction and cost gas.
  - "read" functions (verifyCertificate) are free calls — no gas, no signing.
"""

import json
import os
from web3 import Web3
from app.config import settings

# ════════════════════════════════════════════════════════════
# 1. CONNECT TO POLYGON
# ════════════════════════════════════════════════════════════
# Web3 talks to the blockchain via an RPC endpoint (like an API URL).
# This is the same RPC URL you added to MetaMask, but used server-side.

w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL))

def check_connection():
    """Verify we can reach the blockchain node."""
    if not w3.is_connected():
        raise ConnectionError("Cannot connect to Polygon RPC. Check POLYGON_RPC_URL in .env")
    print(f"✅ Connected to Polygon | Chain ID: {w3.eth.chain_id}")
    return True

# ════════════════════════════════════════════════════════════
# 2. LOAD THE CONTRACT
# ════════════════════════════════════════════════════════════
# To interact with a deployed contract, web3.py needs TWO things:
#   1. The contract ADDRESS (where it lives on-chain)
#   2. The ABI (what functions it has and their signatures)

def load_contract():
    """
    Load the TrustChain contract instance.
    
    Returns a web3 Contract object that exposes .functions for
    each Solidity function (registerUniversity, issueCertificate, etc).
    """
    # Load ABI from the JSON file we saved from Remix
    abi_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "contracts", "TrustChain_ABI.json"
    )
    with open(abi_path, "r") as f:
        abi = json.load(f)
    
    # Create the contract object
    # checksum_address converts lowercase hex to mixed-case checksum format
    contract_address = Web3.to_checksum_address(settings.CONTRACT_ADDRESS)
    contract = w3.eth.contract(address=contract_address, abi=abi)
    
    return contract

# Load once at module level (singleton pattern)
contract = load_contract()

# ════════════════════════════════════════════════════════════
# 3. TRANSACTION HELPER (for write operations)
# ════════════════════════════════════════════════════════════
# Every function that MODIFIES blockchain state needs a transaction.
# Transactions must be:
#   1. Built (specify gas, nonce, chainId)
#   2. Signed (with the admin's private key)
#   3. Sent (broadcast to the network)
#   4. Waited for (until mined into a block)

def _send_transaction(function_call, sender_address=None, private_key=None):
    """
    Internal helper: build → sign → send → wait for any contract write.
    
    Args:
        function_call: A contract function call, e.g., 
                       contract.functions.registerUniversity(addr)
        sender_address: The wallet address sending the tx (defaults to admin)
        private_key: The private key to sign with (defaults to admin key)
    
    Returns:
        tx_receipt: The transaction receipt (contains tx hash, gas used, logs)
    """
    if sender_address is None:
        sender_address = Web3.to_checksum_address(settings.ADMIN_WALLET_ADDRESS)
    if private_key is None:
        private_key = settings.ADMIN_PRIVATE_KEY
    
    # Step 1: Get the current nonce (transaction count) for this wallet
    # Each tx must have a unique, sequential nonce to prevent replay attacks
    nonce = w3.eth.get_transaction_count(sender_address)
    
    # Step 2: Build the transaction
    tx = function_call.build_transaction({
        "from": sender_address,
        "nonce": nonce,
        "gas": 300_000,          # Max gas willing to spend (unused gas is refunded)
        "gasPrice": w3.eth.gas_price,  # Current network gas price
        "chainId": w3.eth.chain_id,    # 80002 for Amoy testnet
    })
    
    # Step 3: Sign the transaction with the private key
    # This proves the admin authorized this action — replaces MetaMask's role
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    
    # Step 4: Broadcast the signed transaction to the network
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    # Step 5: Wait for the transaction to be mined (included in a block)
    # This blocks until confirmation (usually 2-5 seconds on Polygon)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    
    return tx_receipt

# ════════════════════════════════════════════════════════════
# 4. CONTRACT FUNCTIONS — WRITE (cost gas, need signing)
# ════════════════════════════════════════════════════════════

def register_university_on_chain(wallet_address: str) -> dict:
    """
    Register a university's wallet on the smart contract.
    
    Called after admin approves a university application.
    Maps the wallet address as an authorized certificate issuer.
    
    Solidity: function registerUniversity(address wallet) external onlyAdmin
    
    Args:
        wallet_address: The university's Ethereum/Polygon wallet address
        
    Returns:
        dict with tx_hash and status
    """
    checksum_addr = Web3.to_checksum_address(wallet_address)
    
    # Build the function call (doesn't execute yet)
    func_call = contract.functions.registerUniversity(checksum_addr)
    
    # Send it as a signed transaction from the admin wallet
    receipt = _send_transaction(func_call)
    
    return {
        "tx_hash": receipt.transactionHash.hex(),
        "status": "success" if receipt.status == 1 else "failed",
        "gas_used": receipt.gasUsed,
        "block_number": receipt.blockNumber
    }


def issue_certificate_on_chain(cert_hash: bytes, encrypted_cid: str) -> dict:
    """
    Issue a certificate on the smart contract.
    
    Stores the certificate hash and encrypted IPFS CID on-chain.
    
    Solidity: function issueCertificate(bytes32 certHash, string encCID) 
              external onlyUniversity
    
    Args:
        cert_hash: 32-byte SHA-256 hash of the certificate data
        encrypted_cid: The AES-encrypted IPFS CID string
        
    Returns:
        dict with tx_hash and status
        
    NOTE: This is called from the ADMIN wallet because of the 
    single-wallet architecture decision. The admin wallet must first
    be registered as a "university" for each issuance, OR you 
    modify the contract to allow admin to issue on behalf of universities.
    """
    # Ensure cert_hash is exactly 32 bytes
    if isinstance(cert_hash, str):
        # If it's a hex string, convert to bytes
        cert_hash = bytes.fromhex(cert_hash.replace("0x", ""))
    
    func_call = contract.functions.issueCertificate(cert_hash, encrypted_cid)
    receipt = _send_transaction(func_call)
    
    return {
        "tx_hash": receipt.transactionHash.hex(),
        "status": "success" if receipt.status == 1 else "failed",
        "gas_used": receipt.gasUsed,
        "block_number": receipt.blockNumber
    }


def revoke_certificate_on_chain(cert_hash: bytes) -> dict:
    """
    Revoke a certificate on the smart contract.
    
    Marks the certificate as revoked — it can still be looked up
    but verifyCertificate will return status="revoked".
    
    Solidity: function revokeCertificate(bytes32 certHash) 
              external onlyUniversity
    
    Args:
        cert_hash: 32-byte hash of the certificate to revoke
        
    Returns:
        dict with tx_hash and status
    """
    if isinstance(cert_hash, str):
        cert_hash = bytes.fromhex(cert_hash.replace("0x", ""))
    
    func_call = contract.functions.revokeCertificate(cert_hash)
    receipt = _send_transaction(func_call)
    
    return {
        "tx_hash": receipt.transactionHash.hex(),
        "status": "success" if receipt.status == 1 else "failed",
        "gas_used": receipt.gasUsed,
        "block_number": receipt.blockNumber
    }


# ════════════════════════════════════════════════════════════
# 5. CONTRACT FUNCTIONS — READ (free, no gas, no signing)
# ════════════════════════════════════════════════════════════

def verify_certificate_on_chain(cert_hash: bytes) -> dict:
    """
    Verify a certificate on the smart contract.
    
    This is a VIEW function — it's FREE (no gas), no transaction needed.
    Anyone can call this.
    
    Solidity: function verifyCertificate(bytes32 certHash) external view
              returns (bool exists, string status, address issuer, uint256 timestamp)
    
    Args:
        cert_hash: 32-byte hash of the certificate to verify
        
    Returns:
        dict with exists, status, issuer, timestamp
    """
    if isinstance(cert_hash, str):
        cert_hash = bytes.fromhex(cert_hash.replace("0x", ""))
    
    # .call() executes locally — no transaction, no gas
    result = contract.functions.verifyCertificate(cert_hash).call()
    
    return {
        "exists": result[0],
        "status": result[1],        # "valid", "revoked", or "invalid"
        "issuer": result[2],        # Wallet address of issuing university
        "timestamp": result[3]      # Unix timestamp of issuance
    }


def is_university_registered(wallet_address: str) -> bool:
    """
    Check if a wallet address is registered as a university.
    
    Reads the public mapping: mapping(address => bool) public universities
    
    Args:
        wallet_address: The wallet address to check
        
    Returns:
        True if registered, False otherwise
    """
    checksum_addr = Web3.to_checksum_address(wallet_address)
    return contract.functions.universities(checksum_addr).call()


def get_admin_address() -> str:
    """
    Get the admin address stored in the contract.
    
    Reads the public variable: address public admin
    
    Returns:
        The admin wallet address
    """
    return contract.functions.admin().call()
