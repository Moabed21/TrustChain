import hashlib
def hash_pdf(pdf_bytes: bytes) -> str:

    return hashlib.sha256(pdf_bytes).hexdigest()
  #we replace teh way that we hash certs from instead of hashing the metadata we hash the pdf file itself to make it more secure and to make it tamperproof

def hash_to_bytes32(hex_string: str) -> bytes:
    return bytes.fromhex(hex_string.replace("0x", ""))
