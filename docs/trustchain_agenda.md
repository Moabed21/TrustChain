# TrustChain — Session Agenda
### Last updated: April 26, 2026

---

## Week 1 — Setup

### S1 — Project scaffolding `✅ done`
- Folder structure via bash script
- requirements.txt, .env, config.py
- FastAPI app with lifespan context manager

### S2 — Pydantic models `✅ done`
- user.py, university.py, certificate.py
- Base / Create / InDB / Response convention
- database.py with Motor async client

### S3 — Auth router `✅ done`
- POST /login, GET /me, POST /logout
- JWT with sub/email/role/wallet_address
- 401 vs 403 handling, create_admin.py seed script

---

## Week 2 — Core Routers

### S4 — Auth middleware + universities router `✅ done`
- get_current_user, require_admin, require_university
- POST /register, GET /applications, approve/reject, suspend/reactivate

---

## Week 3 — Smart Contract + Wallet Architecture

### S5 — Wallet architecture decision `✅ done`
- Evaluated 10 wallet/gas management solutions
- Selected Solution 10: Local Keystore (ethers.js in browser) + Auto-Funding
- University wallets derived locally in browser, backend never sees private key
- Backend auto-funds university wallet with MATIC on first login

### S5b — Smart contract `✅ done`
- TrustChain.sol written with full inline comments
- Mappings, Certificate struct (with exists bool), modifiers, events
- Uses bytes32 for certHash (gas efficient, compatible with ethers.js)
- exists bool used instead of timestamp==0 check (explicit and safe)
- Deploys to Polygon Amoy testnet via Remix + MetaMask
- ⚠️ Deploy from Remix, save CONTRACT_ADDRESS + ADMIN_WALLET_ADDRESS to .env

### S6 — Smart contract test + verify `⬜ pending`
- Test all functions in Remix console
- Verify registerUniversity, issueCertificate, revoke, verifyCertificate
- Check access control (wrong caller should fail)
- Confirm on Amoy explorer (amoy.polygonscan.com)

---

## Week 4 — Services Layer

### S7 — hashing.py + encryption.py `✅ done`
- SHA-256 hashing of certificate fields (returns str hex digest)
- AES-256-GCM encrypt/decrypt for PDF (bytes→str) and CID (str→str)
- Fixed: padding bug in _decrypt (urlsafe_b64decode requires = padding)
- hash_to_bytes32() converter for Web3.py bytes32 contract calls

### S8 — ipfs.py + qr.py `✅ done`
- Pinata upload encrypted PDF (str → CID str)
- Pinata fetch by CID (CID str → encrypted str)
- QR code generation embedding encrypted CID (str → base64 PNG str)
- QR decode utility (base64 PNG str → encrypted CID str)

### S8b — config.py + funding.py + wallet endpoint `✅ done`
- config.py: added FUNDER_WALLET_ADDRESS, FUNDER_PRIVATE_KEY, FUNDING_AMOUNT_WEI
- services/funding.py: sends MATIC from funder wallet to university wallet
  - get_web3(): connects to Polygon Amoy via HTTPProvider
  - fund_university_wallet(): builds, signs, broadcasts MATIC transfer tx
- models/university.py: fixed wallet_address: Optional[str] = None
- routers/universities.py:
  - Fixed bug: "Approved" → "Active" in approve_application
  - Added WalletRequest model
  - Added PUT /me/wallet endpoint (saves address + triggers auto-funding)

### S9 — blockchain.py `⬜ next`
- Web3.py connection to Polygon Amoy
- Call registerUniversity (admin signs, called after university approval)
- Call issueCertificate and revokeCertificate (university signs via frontend)
- Call verifyCertificate and isUniversityRegistered (read-only, free)
- ABI loading from contract JSON

---

## Week 5 — Certificates Router

### S10 — POST /api/certificates `⬜ pending`
- Full issuance flow: validate → hash → encrypt PDF → IPFS → encrypt CID → blockchain → QR → save to DB
- Duplicate hash guard
- Increment university total_certificates counter

### S11 — Remaining certificates endpoints `⬜ pending`
- GET /api/certificates (list for university)
- GET /api/certificates/{id} (details)
- PUT /api/certificates/{id}/revoke
- GET /api/certificates/{id}/download (PDF)

---

## Week 6 — Verify Router

### S12 — Verify router `⬜ pending`
- POST /api/verify — verify by hash against blockchain
- POST /api/verify/qr — decrypt QR → decrypt CID → fetch IPFS → decrypt PDF → hash → verify
- Return VALID / REVOKED / FAKE clearly

---

## Week 7 — Testing + Polish

### S13 — End-to-end testing `⬜ pending`
- Full flow: register university → approve → connect wallet → issue cert → verify → revoke → verify again
- Edge cases: fake cert, revoked cert, wrong role, wrong university revoking
- Error handling and status code review

### S14 — API documentation + cleanup `⬜ pending`
- Review all FastAPI /docs (Swagger) descriptions
- Clean up any TODO / placeholder code
- Confirm .env variables are complete and documented

---

## Week 8 — Frontend Integration

### S15 — Frontend handoff + integration `⬜ pending`
- Frontend team implements S10 wallet flow (guide delivered: TrustChain_Frontend_S10_Guide.md)
- CORS setup, test React calls against live backend
- Fix any integration issues found

### S16 — Final demo prep `⬜ pending`
- Full system demo run-through
- Prepare sample data (test university, test certificates)
- Confirm Amoy testnet funder wallet has enough MATIC for demo
- Confirm contract deployed and admin wallet registered

---

## Current File Status

```
app/
├── main.py                    ✅ done
├── config.py                  ✅ done (added funder wallet vars)
├── database.py                ✅ done
├── middleware/
│   └── auth_middleware.py     ✅ done
├── models/
│   ├── user.py                ✅ done
│   ├── university.py          ✅ done (fixed wallet_address Optional)
│   └── certificate.py         ✅ done
├── routers/
│   ├── auth.py                ✅ done
│   ├── universities.py        ✅ done (fixed Approved→Active, added wallet endpoint)
│   ├── certificates.py        ⬜ not started
│   └── verify.py              ⬜ not started
└── services/
    ├── hashing.py             ✅ done
    ├── encryption.py          ✅ done (padding fix applied)
    ├── ipfs.py                ✅ done
    ├── qr.py                  ✅ done
    ├── funding.py             ✅ done
    └── blockchain.py          ⬜ next

contracts/
└── TrustChain.sol             ✅ written — ⚠️ needs deployment on Amoy

docs/
└── TrustChain_Frontend_S10_Guide.md  ✅ delivered to frontend team
```

---

## Remaining Work This Sprint (3 sessions left)

```
Session 1 (today):   blockchain.py
Session 2:           certificates.py router (full issuance flow)
Session 3:           verify.py router + final review
```

---

## .env Checklist

```
MONGODB_URL                ✅
DATABASE_NAME              ✅
JWT_SECRET_KEY             ✅
JWT_ALGORITHM              ✅
ACCESS_TOKEN_EXPIRE_MINUTES ✅
POLYGON_RPC_URL            ✅ https://rpc-amoy.polygon.technology
CONTRACT_ADDRESS           ⚠️ fill after Remix deployment
ADMIN_WALLET_ADDRESS       ⚠️ fill after Remix deployment
ADMIN_PRIVATE_KEY          ⚠️ deployer wallet private key
FUNDER_WALLET_ADDRESS      ⚠️ can be same as ADMIN_WALLET_ADDRESS on testnet
FUNDER_PRIVATE_KEY         ⚠️ can be same as ADMIN_PRIVATE_KEY on testnet
FUNDING_AMOUNT_WEI         ✅ 10000000000000000 (0.01 MATIC)
PINATA_API_KEY             ✅
PINATA_SECRET_KEY          ✅
PINATA_JWT_KEY             ✅
AES_SECRET_KEY             ✅
```

---

*TrustChain Backend — Alqasam & Moabed | April 2026*
