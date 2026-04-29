# TrustChain — Backend Status

> **Last updated:** 2026-04-27  
> **Scope:** Backend only (FastAPI + Blockchain + Services)  
> **Repo:** https://github.com/Moabed21/TrustChain  
> **Team:** Alqasam (backend) + Moabed (backend)

---

## 1. Project Overview

TrustChain is a blockchain-based academic certificate verification system.

| Step | What happens |
|------|-------------|
| 1 | University uploads student PDF → backend hashes, encrypts, uploads to IPFS |
| 2 | Certificate hash + encrypted CID recorded on Polygon blockchain via MetaMask |
| 3 | QR code containing encrypted CID is generated and returned |
| 4 | Employer scans QR → backend decrypts CID → fetches PDF from IPFS → verifies hash on-chain |
| 5 | Result: **VALID**, **REVOKED**, or **FAKE** |

---

## 2. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | FastAPI | Async-first, chosen over Flask |
| Database | MongoDB + Motor | Async driver for non-blocking DB calls |
| Blockchain | Polygon Amoy testnet | Mumbai deprecated; Chain ID 80002 |
| Smart Contract | Solidity ^0.8.19 | Deployed via Remix IDE |
| IPFS | Pinata (REST API) | Upload via `pinFileToIPFS`, fetch via gateway |
| Auth | JWT (python-jose) | HS256, token includes sub/email/role/wallet |
| Password | bcrypt (direct) | NOT passlib — Python 3.14 incompatibility |
| Encryption | AES-256-GCM (cryptography lib) | For PDF bytes and IPFS CID strings |
| Hashing | SHA-256 (hashlib) | PDF fingerprint, converted to bytes32 for contract |
| QR | qrcode + pyzbar | Generate and decode QR images |
| HTTP Client | httpx | Async calls to Pinata |
| Config | pydantic-settings | Reads `.env` automatically |
| Server | Uvicorn | Local development |

---

## 3. Project Structure & File Status

```
Graduation_Project_2/
├── app/
│   ├── __init__.py
│   ├── main.py                  ✅ Complete — lifespan, 4 routers mounted
│   ├── config.py                ✅ Complete — 16 env vars via pydantic-settings
│   ├── database.py              ✅ Complete — Motor client, 4 indexes, sparse wallet
│   ├── middleware/
│   │   └── auth_middleware.py   ✅ Complete — get_current_user, require_admin, require_university
│   ├── models/
│   │   ├── user.py              ✅ Complete — UserBase, UserCreate, UserInDB, UserResponse
│   │   ├── university.py        ✅ Complete — UniversityBase/Create/InDB/Response
│   │   └── certificate.py       ✅ Complete — CertificateBase/Create/InDB/Response
│   ├── routers/
│   │   ├── auth.py              ✅ Complete — 3/3 endpoints (login, me, logout)
│   │   ├── universities.py      ✅ Complete — 8/8 endpoints (register, apps, approve, reject, get, suspend, reactivate, wallet)
│   │   ├── certificates.py      ✅ Complete — 7/7 endpoints (create, confirm, list, get, revoke, revoke/confirm)
│   │   └── verify.py            ⬜ Stub only — placeholder root endpoint
│   ├── services/
│   │   ├── hashing.py           ✅ Complete — hash_pdf(), hash_to_bytes32()
│   │   ├── encryption.py        ✅ Complete — AES-256-GCM encrypt/decrypt for PDF + CID
│   │   ├── ipfs.py              ✅ Complete — upload_to_ipfs(), fetch_from_ipfs()
│   │   ├── qr.py                ✅ Complete — generate_qr(), decode_qr()
│   │   ├── blockchain.py        ✅ Complete — 7 functions (register, issue, revoke, verify, check uni, get admin, verify receipt)
│   │   └── funding.py           ✅ Complete — fund() sends MATIC from admin to university wallet
├── contracts/
│   ├── TrustChain.sol           ✅ Complete — deployed on Polygon Amoy
│   └── TrustChain_ABI.json      ✅ Complete — 6 functions + 3 events
├── tests/
│   ├── funding_test.py          🔄 Quick manual test script (not pytest)
│   ├── test_auth.py             ⬜ Empty (0 bytes)
│   ├── test_certificates.py     ⬜ Empty (0 bytes)
│   ├── test_universities.py     ⬜ Empty (0 bytes)
│   └── test_verify.py           ⬜ Empty (0 bytes)
├── requirements.txt             ✅ 19 dependencies listed
├── .env                         ✅ 16 vars (gitignored)
└── .gitignore                   ✅ Configured
```

---

## 4. Configuration (config.py)

16 environment variables loaded from `.env` via `pydantic-settings`:

| Variable | Type | Purpose |
|----------|------|---------|
| `APP_NAME` | str | Application name |
| `DEBUG` | bool | Debug mode toggle |
| `SECRET_KEY` | str | General encryption seed |
| `MONGODB_URL` | str | MongoDB connection string |
| `DATABASE_NAME` | str | MongoDB database name |
| `JWT_SECRET_KEY` | str | JWT signing secret |
| `JWT_ALGORITHM` | str | JWT algorithm (HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | int | Token expiry duration |
| `POLYGON_RPC_URL` | str | Polygon Amoy RPC endpoint |
| `CONTRACT_ADDRESS` | str | Deployed TrustChain contract address |
| `ADMIN_WALLET_ADDRESS` | str | Admin wallet (contract deployer) |
| `ADMIN_PRIVATE_KEY` | str | Admin private key (for signing admin txs) |
| `FUNDING_AMOUNT` | int | Wei amount sent to each new university wallet |
| `PINATA_API_KEY` | str | Pinata API key |
| `PINATA_SECRET_KEY` | str | Pinata secret key |
| `PINATA_JWT_KEY` | str | Pinata JWT (unused currently, kept for future) |
| `AES_SECRET_KEY` | str | Base64-encoded 32-byte AES key |
| `CHAIN_ID` | int | 80002 (Polygon Amoy) |
| `GAS` | int | Gas limit for funding transactions |

---

## 5. Database Design (database.py)

### Collections

| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `users` | Admin accounts only | `email`, `hashed_password`, `role` |
| `universities` | Approved/Active universities | `email`, `wallet_address`, `status`, `total_certificates` |
| `applications` | Pending/Rejected registrations | Same fields as universities, transient |
| `certificates` | Issued certificates | `hashed_certificate`, `enc_cid`, `qr_code`, `status`, `tx_hash` |

### Indexes

| Collection | Field | Type |
|-----------|-------|------|
| `users` | `email` | unique |
| `universities` | `email` | unique |
| `universities` | `wallet_address` | unique + **sparse** (allows multiple nulls) |
| `certificates` | `hashed_certificate` | unique |
| `applications` | `email` | unique |

---

## 6. Authentication & Middleware

### JWT Token Payload
```json
{
  "sub": "<MongoDB _id as string>",
  "email": "user@example.com",
  "role": "admin | university",
  "wallet_address": "0x... | null",
  "exp": 1234567890
}
```

### Middleware Functions

| Function | What it does | Returns |
|----------|-------------|---------|
| `get_current_user()` | Decodes JWT, searches `users` → `universities` | User dict |
| `require_admin()` | `get_current_user()` + checks `role == "admin"` | User dict or 403 |
| `require_university()` | `get_current_user()` + checks `role == "university"` | User dict or 403 |

---

## 7. API Endpoints — 21 Total

### Auth Router — `/api/auth` ✅ 3/3

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/login` | Public | Login with email/password, returns JWT |
| `GET` | `/me` | Any authenticated | Get current user info |
| `POST` | `/logout` | Public | Returns success message (client-side token removal) |

**Status gates at login:** Pending → 403, Suspended → 403, wrong password → 401

### Universities Router — `/api/universities` ✅ 9/9

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/register` | Public | Submit university application |
| `GET` | `/applications` | Admin | List pending applications |
| `PUT` | `/applications/{id}/approve` | Admin | Approve → move to universities collection |
| `PUT` | `/applications/{id}/reject` | Admin | Mark as rejected |
| `GET` | `/{id}` | Admin | Get university details |
| `PUT` | `/{id}/suspend` | Admin | Suspend an active university |
| `PUT` | `/{id}/reactivate` | Admin | Reactivate a suspended university |
| `PUT` | `/me/wallet` | University | Register wallet + fund + on-chain register |
| `GET` | `/all_universities` | Admin | List all registered universities (paginated: `?page=1&limit=100`) |

### Certificates Router — `/api/certificates` ✅ 6/6

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/` | University | Create certificate (hash, encrypt, IPFS, QR) → returns data for MetaMask signing |
| `POST` | `/{id}/confirm` | University | Confirm blockchain tx → sets status to "Issued" |
| `GET` | `/` | University | List own certificates |
| `GET` | `/{id}` | University | Get certificate by ID |
| `PUT` | `/{id}/revoke` | University | Start revocation → sets status to "PendingRevocation" |
| `POST` | `/{id}/revoke/confirm` | University | Confirm revocation tx → sets status to "Revoked" |

**Two-phase pattern:** Both issuance and revocation use a prepare → sign → confirm flow because MetaMask signing happens on the frontend.

### Verify Router — `/api/verify` ✅ 3/3

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/` | Public | Health check — confirms verify router is mounted |
| `POST` | `/file` | Public | Upload PDF → hash → check on blockchain → VALID/REVOKED/FAKE |
| `POST` | `/qr` | Public | Upload QR image → decode → decrypt CID → fetch IPFS → decrypt PDF → hash → check on blockchain |

**Both verification endpoints are public** — no auth required. Employers, students, anyone can verify.

---

## 8. Services Layer

### hashing.py ✅
| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `hash_pdf(pdf_bytes)` | raw PDF bytes | SHA-256 hex string | Certificate fingerprint |
| `hash_to_bytes32(hex_string)` | hex string | bytes (32 bytes) | Convert for smart contract `bytes32` param |

### encryption.py ✅
| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `encrypt_pdf(pdf_data)` | bytes | base64url string | Encrypt PDF before IPFS upload |
| `decrypt_pdf(pdf_data)` | base64url string | bytes | Decrypt PDF after IPFS fetch |
| `encrypt_cid(plaintext_cid)` | CID string | base64url string | Encrypt CID before storing / embedding in QR |
| `decrypt_cid(encrypted_cid)` | base64url string | CID string | Decrypt CID for IPFS fetch |

**Algorithm:** AES-256-GCM with 12-byte random nonce. Blob format: `[12B nonce][ciphertext][16B auth tag]`. Key from `AES_SECRET_KEY` (base64-encoded 32 bytes).

### ipfs.py ✅
| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `upload_to_ipfs(encrypted_pdf)` | base64url string | CID string | Pin encrypted PDF to IPFS via Pinata |
| `fetch_from_ipfs(cid)` | CID string | base64url string | Fetch encrypted PDF from Pinata gateway |

**Client:** `httpx.AsyncClient` for async HTTP. Timeout: 30s. Auth: `pinata_api_key` + `pinata_secret_api_key` headers.

### qr.py ✅
| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `generate_qr(encrypted_cid)` | encrypted CID string | base64 PNG string | Generate QR code image |
| `decode_qr(qr_base64)` | base64 PNG string | encrypted CID string | Decode QR code back to data |

**QR settings:** `ERROR_CORRECT_H` (30% error correction), auto version, 10px box, 4-module border.

### blockchain.py ✅
| Function | Caller | Gas Cost | Purpose |
|----------|--------|----------|---------|
| `register_university_on_chain(wallet)` | Admin (backend signs) | Yes | Register university wallet on contract |
| `issue_certificate_on_chain(hash, cid, wallet, key)` | University | Yes | Record certificate on-chain |
| `revoke_certificate_on_chain(hash, wallet, key)` | University | Yes | Flip `isRevoked` flag on-chain |
| `verify_certificate_on_chain(hash)` | Anyone | **Free** (view) | Check VALID/REVOKED/FAKE |
| `is_university_registered(wallet)` | Anyone | **Free** (view) | Check if wallet is registered |
| `get_admin_address()` | Anyone | **Free** (view) | Get contract admin address |
| `verify_transaction_receipt(tx_hash)` | Backend | **Free** (read) | Verify tx exists, succeeded, targets our contract |

**Note:** `issue_certificate_on_chain` and `revoke_certificate_on_chain` exist in the service but are **NOT called by any router** — the current architecture has the frontend signing via MetaMask and the backend only verifying receipts via `verify_transaction_receipt`.

### funding.py ✅
| Function | Purpose |
|----------|---------|
| `fund(wallet_address)` | Send `FUNDING_AMOUNT` wei from admin wallet to new university wallet |

**Called from:** `universities.py → PUT /me/wallet` after wallet validation.

---

## 9. Smart Contract — TrustChain.sol

**Deployed on:** Polygon Amoy testnet (Chain ID: 80002)  
**Solidity version:** ^0.8.19  
**ABI file:** `contracts/TrustChain_ABI.json`

### State Variables
```
address private admin                              → contract deployer
mapping(bytes32 => Certificate) private certificates → hash → cert data
mapping(address => bool) public registeredUniversities → wallet → registered?
```

### Certificate Struct
```
string  encryptedCID   → AES-256-GCM encrypted IPFS CID
address issuer         → wallet of issuing university
uint256 timestamp      → block.timestamp at issuance
bool    isRevoked      → revocation flag
bool    exist          → existence flag (distinguishes fake from revoked)
```

### Functions
| Function | Access | Mutates | Purpose |
|----------|--------|---------|---------|
| `registerUniversity(address)` | onlyAdmin | Yes | Whitelist university wallet |
| `issueCertificate(bytes32, string)` | onlyUniversity | Yes | Record cert hash + encrypted CID |
| `revokeCertificate(bytes32)` | onlyUniversity (issuer only) | Yes | Flip isRevoked to true |
| `verifyCertificate(bytes32)` | Anyone (view) | No | Returns (exist, isRevoked, issuer, timestamp) |
| `isUniversityRegistered(address)` | Anyone (view) | No | Returns bool |
| `getAdmin()` | Anyone (view) | No | Returns admin address |

### Events
```
UniversityRegistered(address indexed wallet)
CertificateIssued(bytes32 indexed certificateHash, address indexed issuer)
CertificateRevoked(bytes32 indexed certificateHash, address indexed revokedBy)
```

### Verification Results
| `exist` | `isRevoked` | Result |
|---------|-------------|--------|
| false | — | **FAKE** |
| true | false | **VALID** |
| true | true | **REVOKED** |

---

## 10. Certificate Lifecycle

### Status Flow
```
Pending → Issued → Revoked
              ↓
       PendingRevocation → Revoked
```

### Issuance Flow (Two-Phase)

```
Phase 1 — POST /api/certificates (backend)
├── 1. Validate JWT + check university is Active + has wallet
├── 2. Read uploaded PDF into memory
├── 3. hash_pdf(pdf_bytes) → SHA-256 hex string
├── 4. Check duplicate hash in MongoDB
├── 5. encrypt_pdf(pdf_bytes) → base64url ciphertext
├── 6. upload_to_ipfs(encrypted_pdf) → CID
├── 7. encrypt_cid(CID) → encrypted CID
├── 8. generate_qr(encrypted_cid) → base64 PNG
├── 9. Save to MongoDB with status="Pending"
└── 10. Return cert_hash_bytes + encrypted_cid to frontend

Phase 2 — POST /api/certificates/{id}/confirm (after MetaMask)
├── 1. Frontend calls issueCertificate(certHash, encCid) via MetaMask
├── 2. Frontend sends tx_hash to /confirm endpoint
├── 3. verify_transaction_receipt(tx_hash) → validates on-chain
├── 4. Check signer matches university wallet
├── 5. Update status → "Issued", save tx_hash
└── 6. Increment university total_certificates counter
```

### Revocation Flow (Two-Phase)
```
Phase 1 — PUT /api/certificates/{id}/revoke
├── 1. Validate ownership + status is "Issued"
├── 2. Update status → "PendingRevocation"
└── 3. Return cert_hash_bytes to frontend

Phase 2 — POST /api/certificates/{id}/revoke/confirm
├── 1. Frontend calls revokeCertificate(certHash) via MetaMask
├── 2. Frontend sends tx_hash to /revoke/confirm endpoint
├── 3. verify_transaction_receipt(tx_hash) → validates on-chain
├── 4. Check signer matches university wallet
└── 5. Update status → "Revoked"
```

---

## 11. Wallet Architecture — Solution 10

**Decision:** Local Keystore (Encrypted JSON) + Auto-Funding

Each university manages their own wallet. The private key never touches the backend.

### First Login (Wallet Registration)
```
1. Frontend generates random private key
2. Encrypts private key with user's password → Keystore JSON
3. Stores encrypted JSON in localStorage (or prompts download)
4. Sends wallet_address to backend → PUT /me/wallet
5. Backend validates address format (EIP-55 checksum)
6. Backend checks address not used by another university
7. Backend saves wallet_address to MongoDB
8. Backend calls fund(wallet_address) → sends MATIC from admin
9. Backend calls register_university_on_chain(wallet_address) → whitelist on contract
10. Returns: wallet_address, funded (bool), funding_tx_hash, registered_on_chain (bool), registration_tx_hash
```

### Subsequent Logins
```
1. Password → decrypts Keystore JSON → same private key → same wallet ✅
```

### Password Change
```
1. New password → re-encrypts same key → new JSON saved
2. Wallet address unchanged ✅ — no on-chain update needed
```

### Key Principles
- **Private key never sent to backend** — signing happens client-side via MetaMask
- **Backend only stores public wallet address** — no private keys in MongoDB
- **Each university has their own wallet** — nonce management is per-wallet, no conflicts
- **Admin signs registerUniversity tx** — admin pays gas for whitelisting
- **University signs issueCertificate / revokeCertificate** — university pays gas (funded by admin on first login)

---

## 12. Security Model

| Layer | Protection |
|-------|-----------|
| **Auth** | JWT with HS256, bcrypt password hashing, role-based middleware |
| **Data at rest** | AES-256-GCM encryption for PDFs + CIDs in MongoDB |
| **Data in transit** | Only encrypted PDFs uploaded to IPFS — plaintext never leaves backend |
| **QR codes** | Contain encrypted CID — scanning without backend decryption is useless |
| **Blockchain** | Certificate hashes immutable, revocation on-chain, only issuing university can revoke |
| **Wallet** | Private keys client-side only, backend verifies tx receipts post-signing |
| **API** | Status checks at login (Pending/Suspended → 403), ownership checks on all cert operations |
| **Duplicates** | SHA-256 uniqueness check in MongoDB before IPFS upload + on-chain `require(!certificates[hash].exist)` |

---

## 13. Status Codes Convention

| Code | Meaning | Used When |
|------|---------|-----------|
| 200 | Success | Default successful response |
| 400 | Bad Request | Duplicate, already exists, invalid input, wallet already registered |
| 401 | Unauthorized | Wrong email/password, invalid/expired JWT |
| 403 | Forbidden | Pending/Suspended account, wrong role, certificate belongs to another university |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | IPFS upload failure, unhandled exceptions |

---

## 14. What's Done vs What's Left

### ✅ Complete
- [x] FastAPI app skeleton with lifespan
- [x] MongoDB connection with Motor + all indexes
- [x] Config via pydantic-settings (16 env vars)
- [x] Auth middleware (JWT decode, role guards)
- [x] User / University / Certificate Pydantic models
- [x] Auth router (login, me, logout)
- [x] Universities router (register, approve, reject, get, suspend, reactivate, wallet, all_universities)
- [x] Certificates router (create, confirm, list, get, revoke, revoke/confirm)
- [x] Hashing service (SHA-256 PDF fingerprint)
- [x] Encryption service (AES-256-GCM for PDF + CID)
- [x] IPFS service (Pinata upload/fetch)
- [x] QR service (generate + decode)
- [x] Blockchain service (register, issue, revoke, verify, check uni, get admin, verify receipt)
- [x] Funding service (admin → university MATIC transfer)
- [x] Smart contract (TrustChain.sol deployed on Polygon Amoy)
- [x] Contract ABI JSON

### ⬜ Remaining — Backend
- [ ] **Test suite** — all 4 test files are empty (test_auth, test_certificates, test_universities, test_verify)
- [ ] **Download endpoint** — `GET /api/certificates/{id}/download` (fetch from IPFS, decrypt, return PDF)
- [ ] **Error handling polish** — consistent error response format across all routers
- [ ] **API documentation** — update docs to match current endpoints (18 not 17)
- [ ] **Dead code cleanup** — `issue_certificate_on_chain` and `revoke_certificate_on_chain` in blockchain.py are unused (frontend signs instead)

### ⬜ Remaining — Integration
- [ ] Frontend ↔ Backend API integration
- [ ] MetaMask signing flow end-to-end testing
- [ ] Wallet Keystore JSON implementation (frontend responsibility)
- [ ] Demo preparation

---

## 15. Known Issues & Gotchas

| Issue | Details |
|-------|---------|
| `passlib` broken on Python 3.14 | Use `bcrypt` directly — already done |
| `@app.on_event` deprecated | Use `lifespan` context manager — already done |
| `datetime.utcnow()` deprecated 3.12+ | Use `datetime.now(timezone.utc)` — already done |
| Unused blockchain functions | `issue_certificate_on_chain` and `revoke_certificate_on_chain` exist but are never called — frontend signs via MetaMask, backend only verifies receipts |
| `config.py` type defaults | Several `int` fields have `""` as default (e.g., `FUNDING_AMOUNT: int = ""`) — works because `.env` always provides values, but technically incorrect type hints |
| `requirements.txt` includes unused deps | `passlib`, `ipfshttpclient`, `pymongo` are listed but not used directly |
| Test files empty | All 4 pytest test files are 0 bytes |
| `get_applications` returns 200 with HTTPException | `raise HTTPException(status_code=200, ...)` is unusual — should be a normal return |

---

## 16. Endpoint Count Summary

| Router | Endpoints | Status |
|--------|-----------|--------|
| Auth | 3 | ✅ Complete |
| Universities | 9 | ✅ Complete |
| Certificates | 6 | ✅ Complete |
| Verify | 3 | ✅ Complete |
| **Total** | **21** | ✅ All implemented |

---

*TrustChain Backend — Alqasam & Moabed | April 2026*
