# TrustChain — Session Agenda

---

## Week 1 — Setup

### S1 — Project scaffolding `done`
- Folder structure via bash script
- requirements.txt, .env, config.py
- FastAPI app with lifespan context manager

### S2 — Pydantic models `done`
- user.py, university.py, certificate.py
- Base / Create / InDB / Response convention
- database.py with Motor async client

### S3 — Auth router `done`
- POST /login, GET /me, POST /logout
- JWT with sub/email/role/wallet_address
- 401 vs 403 handling, create_admin.py seed script

---

## Week 2 — Core Routers

### S4 — Auth middleware + universities router `done`
- get_current_user, require_admin, require_university
- POST /register, GET /applications, approve/reject, suspend/reactivate

---

## Week 3 — Smart Contract

### S5 — Smart contract — write + deploy `in progress`
- Write TrustChain.sol in Remix IDE
- Mappings, Certificate struct, modifiers, events
- Deploy to Polygon Amoy testnet via MetaMask
- Save contract address + admin wallet to .env

### S6 — Smart contract — test + verify
- Test all functions in Remix console
- Verify registerUniversity, issueCertificate, revoke, verifyCertificate
- Check access control (wrong caller should fail)
- Confirm on Amoy explorer (amoy.polygonscan.com)

---

## Week 4 — Services Layer

### S7 — hashing.py + encryption.py
- SHA-256 hashing of certificate fields
- AES-256 encrypt/decrypt for PDF and CID
- Unit test both with sample data

### S8 — ipfs.py + qr.py
- Pinata upload encrypted PDF, get CID back
- Pinata fetch by CID
- QR code generation embedding encrypted CID
- QR decode utility

### S9 — blockchain.py
- Web3.py connection to Polygon Amoy
- Call issueCertificate and revokeCertificate
- Call verifyCertificate and isUniversityRegistered
- Test end-to-end with deployed contract

---

## Week 5 — Certificates Router

### S10 — POST /api/certificates
- Full issuance flow: validate → hash → IPFS → blockchain → QR → save
- Duplicate hash guard
- Increment university certificates_issued counter

### S11 — Remaining certificates endpoints
- GET /api/certificates (list for university)
- GET /api/certificates/{id} (details)
- PUT /api/certificates/{id}/revoke
- GET /api/certificates/{id}/download (PDF)

---

## Week 6 — Verify Router

### S12 — Verify router
- POST /api/verify — verify by hash against blockchain
- POST /api/verify/qr — decrypt QR, fetch IPFS, verify
- Return VALID / REVOKED / FAKE clearly

---

## Week 7 — Testing + Polish

### S13 — End-to-end testing
- Full flow: register university → issue cert → verify → revoke → verify again
- Edge cases: fake cert, revoked cert, wrong role
- Error handling and status code review

### S14 — API documentation + cleanup
- Review all FastAPI /docs (Swagger) descriptions
- Clean up any TODO / placeholder code
- Confirm .env variables are complete and documented

---

## Week 8 — Frontend Integration

### S15 — Frontend handoff + integration
- Sync with frontend team on API contracts
- CORS setup, test React calls against live backend
- Fix any integration issues found

### S16 — Final demo prep
- Full system demo run-through
- Prepare sample data (test university, test certificates)
- Confirm Amoy testnet wallet funded for demo
