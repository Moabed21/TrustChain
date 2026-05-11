# TrustChain  Backend Status

> **Last updated:** 2026-05-11
> **Scope:** Backend only (FastAPI + Blockchain + Services)
> **Repo:** https://github.com/Moabed21/TrustChain
> **Team:** Alqasam (backend) + Moabed (backend)

---

## 1. Project Overview

TrustChain is a blockchain-based academic certificate verification system.

| Step | What happens |
|------|-------------|
| 1 | University uploads student PDF → backend hashes, encrypts, uploads to IPFS |
| 2 | Certificate hash + encrypted CID recorded on Polygon blockchain via university wallet |
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
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  ✅ Complete  lifespan, 5 routers mounted, CORS middleware
│   ├── config.py                ✅ Complete  16+ env vars via pydantic-settings
│   ├── database.py              ✅ Complete  Motor client, 4 indexes, sparse wallet
│   ├── middleware/
│   │   └── auth_middleware.py   ✅ Complete  get_current_user, require_admin, require_university
│   ├── models/
│   │   ├── user.py              ✅ Complete  UserBase, UserCreate, UserInDB, UserResponse
│   │   ├── university.py        ✅ Complete  UniversityBase/Create/InDB/Response
│   │   └── certificate.py       ✅ Complete  CertificateBase/Create/InDB/Response
│   ├── routers/
│   │   ├── auth.py              ✅ Complete  3/3 endpoints (login, me, logout)
│   │   ├── universities.py      ✅ Complete  10/10 endpoints (+ /stats)
│   │   ├── certificates.py      ✅ Complete  7/7 endpoints (issue, confirm, list, get, download, revoke, revoke/confirm)
│   │   ├── verify.py            ✅ Complete  3/3 endpoints (health, /file, /qr)
│   │   └── activities.py        ✅ Complete  1/1 endpoint (list activities)
│   ├── services/
│   │   ├── hashing.py           ✅ Complete  hash_pdf(), hash_to_bytes32()
│   │   ├── encryption.py        ✅ Complete  AES-256-GCM encrypt/decrypt for PDF + CID
│   │   ├── ipfs.py              ✅ Complete  upload_to_ipfs(), fetch_from_ipfs()
│   │   ├── qr.py                ✅ Complete  generate_qr(), decode_qr()
│   │   ├── blockchain.py        ✅ Complete  7 functions
│   │   └── funding.py           ✅ Complete  fund() sends MATIC from admin to university wallet
├── contracts/
│   ├── TrustChain.sol           ✅ Complete  deployed on Polygon Amoy
│   └── TrustChain_ABI.json      ✅ Complete  6 functions + 3 events
├── tests/
│   ├── funding_test.py          🔄 Quick manual test script (not pytest)
│   ├── test_auth.py             ⬜ Empty (0 bytes)
│   ├── test_certificates.py     ⬜ Empty (0 bytes)
│   ├── test_universities.py     ⬜ Empty (0 bytes)
│   └── test_verify.py           ⬜ Empty (0 bytes)
├── requirements.txt             ✅ 19 dependencies listed
├── .env                         ✅ 16+ vars (gitignored)
└── .gitignore                   ✅ Configured
```

---

## 4. Configuration (config.py)

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
| `CORS_ORIGINS` | list | Allowed frontend origins for CORS |

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

## 7. API Endpoints — 25 Total ✅

### Auth Router — `/api/auth` ✅ 3/3

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/login` | Public | Login — `application/x-www-form-urlencoded` with `username` + `password` |
| `GET` | `/me` | Any authenticated | Get current user info (includes `university_name`) |
| `POST` | `/logout` | Public | Returns success message (client-side token removal) |

### Universities Router — `/api/universities` ✅ 10/10

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/register` | Public | Submit university application |
| `GET` | `/applications` | Admin | List pending applications |
| `PUT` | `/applications/{id}/approve` | Admin | Approve → move to universities collection + log activity |
| `PUT` | `/applications/{id}/reject` | Admin | Mark as rejected + log activity |
| `GET` | `/stats` | Admin | Aggregate stats: total certs, issued, revoked, monthly breakdown |
| `GET` | `/{id}` | Admin | Get university details |
| `PUT` | `/{id}/suspend` | Admin | Suspend an active university + log activity |
| `PUT` | `/{id}/reactivate` | Admin | Reactivate a suspended university + log activity |
| `PUT` | `/me/wallet` | University | Register wallet + fund + on-chain register |
| `GET` | `/all_universities` | Admin | List all registered universities (`?page=1&limit=100`) |

> **⚠️ Route ordering:** `/stats` must be declared before `/{id}` in universities.py to prevent FastAPI from matching `stats` as a MongoDB ObjectId.

**University response fields:** `_id`, `university_name`, `country`, `email`, `status`, `wallet_address`, `total_certificates`, `register_date`

### Certificates Router — `/api/certificates` ✅ 7/7

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/issue` | University | Phase 1: hash PDF, encrypt, IPFS, QR → returns signing data |
| `POST` | `/{id}/confirm` | University | Phase 2: verify tx receipt → set status "Issued" |
| `GET` | `/` | University | List own certificates |
| `GET` | `/{id}/download` | University | Decrypt PDF from IPFS and return as downloadable file |
| `GET` | `/{id}` | University | Get certificate by ID |
| `PUT` | `/{id}/revoke` | University | Phase 1: set status "PendingRevocation" → returns cert_hash_bytes |
| `POST` | `/{id}/revoke/confirm` | University | Phase 2: verify tx receipt → set status "Revoked" |

**Issue endpoint path:** `POST /api/certificates/issue` (not `/api/certificates`)

### Verify Router — `/api/verify` ✅ 3/3

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/` | Public | Health check |
| `POST` | `/file` | Public | Upload PDF → hash → blockchain → VALID/REVOKED/FAKE |
| `POST` | `/qr` | Public | Upload QR image → decode → decrypt CID → fetch IPFS → hash → blockchain |

### Activities Router — `/api/activities` ✅ 1/1

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/` | Admin | Paginated activity log (`?page=1&limit=50`), newest first |

**Activity document fields:** `_id`, `action`, `target`, `actor`, `type`, `date`

**Actions logged:** `approved`, `rejected`, `suspended`, `reactivated` — written by `log_activity()` in universities.py

---

## 8. Services Layer

### hashing.py ✅
- `hash_pdf(pdf_bytes)` → SHA-256 hex string
- `hash_to_bytes32(hex_string)` → bytes (32 bytes) for smart contract

### encryption.py ✅
- `encrypt_pdf(pdf_data)` / `decrypt_pdf(pdf_data)` — AES-256-GCM PDF encryption
- `encrypt_cid(plaintext_cid)` / `decrypt_cid(encrypted_cid)` — AES-256-GCM CID encryption
- **Algorithm:** 12-byte random nonce, blob format: `[12B nonce][ciphertext][16B auth tag]`

### ipfs.py ✅
- `upload_to_ipfs(encrypted_pdf)` → CID string (via Pinata)
- `fetch_from_ipfs(cid)` → base64url string (via Pinata gateway)

### qr.py ✅
- `generate_qr(encrypted_cid)` → base64 PNG string (`ERROR_CORRECT_H`, 10px box)
- `decode_qr(qr_base64)` → encrypted CID string

### blockchain.py ✅
- `register_university_on_chain(wallet)` — admin-signed, registers wallet on contract
- `issue_certificate_on_chain(hash, cid, wallet, key)` — exists but unused (frontend signs)
- `revoke_certificate_on_chain(hash, wallet, key)` — exists but unused (frontend signs)
- `verify_certificate_on_chain(hash)` — free view call, returns VALID/REVOKED/FAKE
- `is_university_registered(wallet)` — free view call
- `get_admin_address()` — free view call
- `verify_transaction_receipt(tx_hash)` — confirms tx exists, succeeded, targets our contract

### funding.py ✅
- `fund(wallet_address)` — sends `FUNDING_AMOUNT` wei from admin wallet to new university wallet

---

## 9. Smart Contract — TrustChain.sol

**Deployed on:** Polygon Amoy testnet (Chain ID: 80002)

### Functions
| Function | Access | Purpose |
|----------|--------|---------|
| `registerUniversity(address)` | onlyAdmin | Whitelist university wallet |
| `issueCertificate(bytes32, string)` | onlyUniversity | Record cert hash + encrypted CID |
| `revokeCertificate(bytes32)` | onlyUniversity (issuer only) | Flip isRevoked to true |
| `verifyCertificate(bytes32)` | Anyone (view) | Returns (exist, isRevoked, issuer, timestamp) |
| `isUniversityRegistered(address)` | Anyone (view) | Returns bool |
| `getAdmin()` | Anyone (view) | Returns admin address |

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
Pending → Issued → PendingRevocation → Revoked
```

### Two-Phase Issuance
```
Phase 1 — POST /api/certificates/issue
  Backend: hash PDF → check duplicate → encrypt → IPFS → encrypt CID → QR → save (status=Pending)
  Returns: certificate_id, cert_hash_bytes (0x hex), encrypted_cid, qr_code

Phase 2 — POST /api/certificates/{id}/confirm
  Frontend signs: contract.issueCertificate(cert_hash_bytes, encrypted_cid) via ethers.js wallet
  Backend: verify_transaction_receipt() → check from==university wallet → status="Issued"
```

### Two-Phase Revocation
```
Phase 1 — PUT /api/certificates/{id}/revoke
  Backend: check ownership + status=Issued → status="PendingRevocation" → return cert_hash_bytes

Phase 2 — POST /api/certificates/{id}/revoke/confirm
  Frontend signs: contract.revokeCertificate(cert_hash_bytes) via ethers.js wallet
  Backend: verify_transaction_receipt() → check from==university wallet → status="Revoked"
```

---

## 11. Wallet Architecture

- University wallet generated client-side via `ethers.Wallet.createRandom()`
- Private key encrypted with user password into Keystore V3 JSON, stored in `localStorage`
- Only public wallet address sent to backend → `PUT /api/universities/me/wallet`
- Backend funds wallet with MATIC, registers it on-chain, saves address to MongoDB
- On subsequent logins: `ethers.Wallet.fromEncryptedJson(keystoreJson, password)` decrypts the wallet into memory
- Decrypted wallet held in `WalletContext` (React) for the session — used directly by IssueCertificate and IssuedCertificates components

---

## 12. What's Done vs What's Left

### ✅ Complete — All 25 endpoints implemented
- Auth router (3/3), Universities router (10/10), Certificates router (7/7), Verify router (3/3), Activities router (1/1)
- All services: hashing, encryption, IPFS, QR, blockchain, funding
- Smart contract deployed on Polygon Amoy
- Activity logging on all admin actions (approve, reject, suspend, reactivate)
- Admin stats endpoint with real certificate counts and monthly breakdown
- `/api/auth/me` returns `university_name` for university accounts

### ⬜ Remaining
- [ ] **Test suite** — all 4 pytest test files are empty


---

## 13. Known Issues & Gotchas

| Issue | Details | Status |
|-------|---------|--------|
| Login format | `POST /api/auth/login` expects `application/x-www-form-urlencoded` with field `username` (not `email`) | By design |
| Unused blockchain functions | `issue_certificate_on_chain` and `revoke_certificate_on_chain` exist but are never called | By design (frontend signs) |
| ~~`config.py` type defaults~~ | ~~Several `int` fields have `""` as default~~ | ✅ Fixed — proper int defaults |
| `requirements.txt` unused deps | `passlib`, `ipfshttpclient`, `pymongo` listed but not directly used | Low priority |
| Test files empty | All 4 pytest test files are 0 bytes | Remaining |
| ~~CORS_ORIGINS parse bug~~ | ~~`split(",")` failed on JSON array strings~~ | ✅ Fixed — uses `json.loads()` |
| ~~CHAIN_ID whitespace~~ | ~~Trailing whitespace caused int parse failure~~ | ✅ Fixed |
| Route ordering | `/stats` must be before `/{id}` in universities.py | ✅ Fixed |

---

*TrustChain Backend — Alqasam & Moabed | May 2026*