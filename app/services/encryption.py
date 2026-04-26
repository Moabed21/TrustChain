from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64
import os
from app.config import settings

def _get_key() -> bytes:
    raw_key = settings.AES_SECRET_KEY
    if not raw_key:
        raise RuntimeError("AES_SECRET_KEY is not set. Please set it in .env")
    key = base64.b64decode(raw_key)
    if len(key) != 32:
        raise RuntimeError("AES_SECRET_KEY must be 32 bytes (base64 encoded).")
    return key
#aes takes two components to encrypt data key above and nonce and auth tag
_NONCE_SIZE = 12
#we have at the end a blob starting nonce size of 12 bytes , at the end 16 bytes auth tag ,between them is the thing we want to encrypt (ciphertext)  => 12/ ciphertext / 16
def _decrypt(data: str) -> bytes:
    key = _get_key()
    padded =data + "="*(4 - len(data)%4)
    #base64url string must be padded to multiple of 4 chars urlsafe_b64encode removes padding we add it back before decoding
    blob = base64.urlsafe_b64decode(padded.encode("utf-8"))
    #first blob[:_NONCE_SIZE] means extract first 12 bytes from the blob, the other blob[_NONCE_SIZE:] means extract the rest of the blob
    nonce, ciphertext = blob[:_NONCE_SIZE], blob[_NONCE_SIZE:]
    plaintext =  AESGCM(key).decrypt(nonce, ciphertext, None)
    return plaintext

def _encrypt(data: bytes) -> str:
    key = _get_key()
    nonce = os.urandom(_NONCE_SIZE)
    cipher = AESGCM(key).encrypt(nonce, data, None)
    blob = nonce + cipher
    return base64.urlsafe_b64encode(blob).decode("utf-8")

def encrypt_pdf(pdf_data: bytes) -> str:
    return _encrypt(pdf_data)

def decrypt_pdf(pdf_data: str) -> bytes:
    return _decrypt(pdf_data)


def encrypt_cid(plaintext_cid: str) -> str:
    return _encrypt(plaintext_cid.encode("utf-8"))

def decrypt_cid(encrypted_cid: str) -> str:
    return _decrypt(encrypted_cid).decode("utf-8")