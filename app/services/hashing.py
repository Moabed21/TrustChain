"""
services/hashing.py
───────────────────
Creates a unique, deterministic fingerprint (hash) for each certificate.

Used as:
  1. The primary identifier for the certificate on the blockchain (bytes32)
  2. The unique key in the MongoDB `certificates` collection
  3. The value embedded in the QR code for verification

Why SHA-256:
  - Produces exactly 32 bytes → matches Solidity's bytes32 type
  - Collision-resistant → two different certs will never share a hash
  - Deterministic → same input always produces the same hash
  - One-way → cannot reverse the hash back to the original data
"""

import hashlib
import json
from datetime import date
def hash_certificate(
    student_name: str,
    major: str,
    graduation_date: date,
    university_id: str
)->str:

    payload = {
        "student_name":student_name.strip().lower(),
        "major":major.strip().lower(),
        "graduation_date":graduation_date.strip(),
        "university_id":university_id.strip()
    }
    cannonical = json.dumps(payload, sort_keys=True,ensure_ascii=False)
    raw_hash = hashlib.sha256(cannonical.encode("utf-8")).hexdigest()

    return raw_hash


def hash_from_hex(hex_string: str) -> bytes:

    return bytes.fromhex(hex_string.replace("0x", ""))
