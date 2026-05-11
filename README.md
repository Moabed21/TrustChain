# TrustChain

> Blockchain-based Academic Certificate Verification System  
> **Stack:** FastAPI · MongoDB · Polygon Amoy · React 18 · ethers.js  
> **Last updated:** 2026-05-11

---

## What is TrustChain?

TrustChain lets universities issue tamper-proof academic certificates on the Polygon blockchain and allows anyone — employers, students, institutions — to instantly verify them.

| Role | What they do |
|------|-------------|
| **Admin** | Approves/rejects university registration requests, manages university access |
| **University** | Issues and revokes certificates on-chain via their encrypted browser wallet |
| **Public** | Verifies any certificate by uploading the PDF or scanning its QR code |

**Verification result:** `VALID` · `REVOKED` · `FAKE`

---

## How it works

```
University uploads PDF
  → Backend hashes + encrypts + uploads to IPFS
  → University wallet signs issueCertificate() on Polygon Amoy
  → Backend confirms receipt → certificate status = "Issued"
  → QR code (containing encrypted IPFS CID) returned for printing

Anyone scans QR or uploads PDF
  → Backend decodes QR → decrypts CID → fetches PDF from IPFS
  → Hashes PDF → checks hash on smart contract
  → Returns VALID / REVOKED / FAKE
```

---

## Repository Structure

```
TrustChain-fixing-frontend/
├── backend/                   FastAPI backend
│   ├── app/
│   │   ├── main.py            Entry point, CORS, 5 routers
│   │   ├── config.py          Environment variables (pydantic-settings)
│   │   ├── database.py        MongoDB Motor client + indexes
│   │   ├── middleware/        JWT auth guards
│   │   ├── models/            Pydantic models (user, university, certificate)
│   │   ├── routers/           auth, universities, certificates, verify, activities
│   │   └── services/          hashing, encryption, ipfs, qr, blockchain, funding
│   ├── contracts/
│   │   ├── TrustChain_ABI.json
│   │   └── TrustChain.sol
│   ├── tests/
│   └── requirements.txt
├── frontend/                  React 18 + Vite frontend
│   ├── src/
│   │   ├── context/           AuthContext, ThemeContext, WalletContext
│   │   ├── services/api.js    All backend endpoints, JWT interceptors
│   │   ├── pages/             PublicPage, LoginPage, RegisterPage, dashboards
│   │   ├── components/        admin/, university/, shared/
│   │   └── contracts/         TrustChain_ABI.json (must match backend)
│   └── package.json
└── docs/
    ├── BACKEND_STATUS.md
    ├── frontend status.md
    └── TrustChain_API_Documentation.md
```

---

## Quick Start

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in all required values (see below)
uvicorn app.main:app --reload
# API docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
# create .env with the three variables below
npm run dev
# runs at http://localhost:5173
```

---

## Environment Variables

### Backend `.env`

```env
APP_NAME=TrustChain
DEBUG=true
SECRET_KEY=your-secret-key

# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=trustchain

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Polygon Amoy
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
CONTRACT_ADDRESS=0x...        # from Remix deployment
ADMIN_WALLET_ADDRESS=0x...    # deployer wallet
ADMIN_PRIVATE_KEY=0x...       # deployer private key
CHAIN_ID=80002
GAS=21000
FUNDING_AMOUNT=10000000000000000   # 0.01 MATIC in wei

# Pinata (IPFS)
PINATA_API_KEY=...
PINATA_SECRET_KEY=...
PINATA_JWT_KEY=...

# Encryption
AES_SECRET_KEY=...   # base64-encoded 32 bytes

# CORS
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_CONTRACT_ADDRESS=0x...        # same as backend CONTRACT_ADDRESS
VITE_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
```

> ⚠️ Both `CONTRACT_ADDRESS` / `VITE_CONTRACT_ADDRESS` and the ABI file must always match the deployed contract. If you redeploy, update both.

---

## API Overview

| Router | Prefix | Endpoints | Auth |
|--------|--------|-----------|------|
| Auth | `/api/auth` | login, me, logout | JWT |
| Universities | `/api/universities` | register, applications, approve/reject, suspend/reactivate, wallet, list, stats | Admin / University |
| Certificates | `/api/certificates` | issue, confirm, list, get, revoke, revoke/confirm | University |
| Verify | `/api/verify` | health, /file, /qr | Public |
| Activities | `/api/activities` | list (paginated) | Admin |

**Full API docs:** [docs/TrustChain_API_Documentation.md](docs/TrustChain_API_Documentation.md) or `http://localhost:8000/docs` when running.

**Login format:** `POST /api/auth/login` expects `application/x-www-form-urlencoded` with fields `username` and `password`.

---

## Blockchain & Wallet

- **Network:** Polygon Amoy testnet (Chain ID: 80002)
- **Contract:** `TrustChain.sol` — functions: `registerUniversity`, `issueCertificate`, `revokeCertificate`, `verifyCertificate`
- **University wallets** are generated entirely in the browser via ethers.js. The private key is encrypted with the user's password into a Keystore V3 JSON and stored in `localStorage`. The backend **never sees the private key**.
- On first login, the backend funds the new wallet with MATIC and registers it on-chain.
- On subsequent logins, the keystore is decrypted in memory and used to sign blockchain transactions directly.

---

## Security

| Layer | Protection |
|-------|-----------|
| Auth | JWT HS256, bcrypt passwords, role-based middleware |
| Data at rest | AES-256-GCM encryption for all PDFs and IPFS CIDs |
| Blockchain | Certificate hashes immutable on-chain; only issuing university can revoke |
| Wallet | Private keys client-side only in encrypted keystore; backend verifies tx receipts |
| QR codes | Contain encrypted CID — useless without backend decryption key |
| Duplicates | SHA-256 uniqueness enforced in MongoDB and on-chain |

---

## Current Status

### ✅ Complete

- All 24 backend API endpoints implemented and working (5 routers)
- Full frontend integration — no mock data anywhere
- Certificate issuance, revocation, and **download** (two-phase: backend + on-chain signing)
- Public verification by PDF upload and QR scan (including live camera)
- Wallet generation, encryption, and session management
- Admin university management (approve, reject, suspend, reactivate)
- Admin dashboard with real-time stats, charts, and activity feed
- Admin activity log — all admin actions recorded in MongoDB
- Public verification shows `VALID`, `REVOKED`, and `FAKE` results with distinct UI
- Download certificate button (functional for file-based verification)
- Light/dark theme system

### ⬜ Remaining

- **Test suite** — all 4 pytest test files are empty
- **`certificateService.js`** — legacy file, no longer imported, can be removed
- **`mockData.js`** — data file no longer imported, can be removed

---

## Team

| Name | Role |
|------|------|
| Alqasam | Backend |
| Moabed | Backend |
| Frontend team | Frontend |

---

*TrustChain — Graduation Project 2026*
