# TrustChain  Frontend Documentation

> **Last updated:** 2026-05-11
> **Scope:** Frontend only (React + ethers.js + Vite)
> **Team:** Frontend

---

## 1. Project Overview

TrustChain is a decentralized Blockchain-based Academic Certificate Verification System. Universities issue and revoke academic certificates on the Polygon Amoy blockchain. Employers and students can publicly verify any certificate via PDF upload or QR scan.

**Tech Stack:**
- **Framework:** React 18, Vite
- **Routing:** React Router DOM v6
- **State Management:** React Context API (`AuthContext`, `ThemeContext`, `WalletContext`)
- **Blockchain:** ethers.js v6 — wallet generation, keystore encryption, contract signing
- **HTTP Client:** axios (with JWT interceptors)
- **Styling:** Vanilla CSS with global custom properties for light/dark mode
- **Data Visualization:** Recharts
- **Icons:** Lucide React

**How to run:**
```bash
npm install
npm run dev
```

**Required environment variables (`.env`):**
```
VITE_API_BASE_URL=http://localhost:8000
VITE_CONTRACT_ADDRESS=0x...
VITE_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
```

---

## 2. Integration Status

**The frontend is fully integrated with the backend.** All mock data has been removed and replaced with real API calls. Authentication, wallet setup, certificate issuance, revocation, and public verification all connect to the live backend.

| Area | Status | Notes |
|------|--------|-------|
| Auth (login/logout) | ✅ Real API | `POST /api/auth/login`, `GET /api/auth/me` |
| University registration | ✅ Real API | `POST /api/universities/register` |
| Admin — pending apps | ✅ Real API | `GET /api/universities/applications` |
| Admin — approve/reject | ✅ Real API | `PUT /api/universities/applications/{id}/approve\|reject` |
| Admin — university list | ✅ Real API | `GET /api/universities/all_universities` |
| Admin — suspend/reactivate | ✅ Real API | `PUT /api/universities/{id}/suspend\|reactivate` |
| Wallet setup | ✅ Real (ethers.js + backend) | `PUT /api/universities/me/wallet` |
| Issue certificate | ✅ Real API + on-chain | `POST /api/certificates/issue` → ethers.js sign → `POST /api/certificates/{id}/confirm` |
| Issued certificates list | ✅ Real API | `GET /api/certificates` |
| Revoke certificate | ✅ Real API + on-chain | `PUT /api/certificates/{id}/revoke` → ethers.js sign → `POST /api/certificates/{id}/revoke/confirm` |
| Public verify by PDF | ✅ Real API | `POST /api/verify/file` |
| Public verify by QR | ✅ Real API | `POST /api/verify/qr` (file upload or live camera) |
| Admin dashboard stats | ✅ Real API | `GET /api/universities/stats` — total certs, issued, revoked, monthly chart |
| Admin activity log | ✅ Real API | `GET /api/activities` — paginated, newest first |
| Certificate download | ✅ Client-side | Uses `URL.createObjectURL()` on the uploaded PDF after successful file-based verification |

---

## 3. Project Structure

```
frontend/src/
├── App.jsx                    ✅ Routes, providers, ProtectedRoute, RoleRoute
├── index.css                  ✅ CSS variables, light/dark theme, global styles
├── main.jsx                   ✅ React entry point
├── context/
│   ├── AuthContext.jsx         ✅ login(), logout(), refreshUser(), updateUser()  real API
│   ├── ThemeContext.jsx        ✅ light/dark toggle
│   └── WalletContext.jsx       ✅ loadWallet(), clearWallet(), pendingPassword
├── services/
│   ├── api.js                  ✅ All 24 backend endpoints mapped, JWT interceptors
│   └── certificateService.js   ⚠️ Legacy file (unused — api.js covers all endpoints)
├── pages/
│   ├── PublicPage.jsx          ✅ PDF + QR verification, live camera scan
│   ├── LoginPage.jsx           ✅ Real auth, wallet decryption on login
│   ├── RegisterPage.jsx        ✅ Real API registration
│   ├── AdminDashboard.jsx      ✅ Wrapper + routing for admin views
│   └── UniversityDashboard.jsx ✅ Wrapper + routing + wallet gate
├── components/
│   ├── admin/
│   │   ├── Dashboard.jsx       ✅ Complete  real stats, charts, and activity feed from API
│   │   ├── PendingApplications.jsx  ✅ Real API — fetch, approve, reject
│   │   ├── RegisteredUniversities.jsx ✅ Real API — fetch, suspend, reactivate + inline error banner
│   │   └── ActivityLog.jsx     ✅ Real API — fetch, search, filter by type
│   ├── university/
│   │   ├── Dashboard.jsx       ✅ Real API — stats computed from real certificate data
│   │   ├── IssueCertificate.jsx ✅ Full 3-step flow: backend → ethers.js sign → confirm
│   │   ├── IssuedCertificates.jsx ✅ Real API — list, revoke (2-step flow)
│   │   ├── CertificateDetailsModal.jsx ✅ Modal UI for certificate details
│   │   └── WalletSetup.jsx     ✅ ethers.js keygen + keystore + backend registration
│   └── shared/
│       ├── ConfirmModal.jsx     ✅ Reusable confirmation dialog
│       ├── Sidebar.jsx          ✅ Role-aware navigation, shows university_name
│       ├── StatusBadge.jsx      ✅ Status pill (Issued, Revoked, Pending, etc.)
│       ├── ThemeToggle.jsx      ✅ Light/dark toggle
│       └── ErrorBoundary.jsx    ✅ React error boundary wrapper
├── contracts/
│   └── TrustChain_ABI.json     ✅ Contract ABI (must match deployed contract)
└── data/
    └── mockData.js             ✅ File exists but no longer imported by any component
```

---

## 4. Auth Flow

### Login
1. `LoginPage` calls `login(email, password)` from `AuthContext`
2. `AuthContext.login()` calls `loginAPI()` → `POST /api/auth/login` (form-encoded: `username` + `password`)
3. On success: stores JWT in `localStorage`, calls `getMeAPI()` → `GET /api/auth/me`
4. User object (`id`, `email`, `role`, `status`, `wallet_address`, `university_name`) stored in state + `localStorage`
5. If `role === "university"`: calls `loadWallet(password)` from `WalletContext` to decrypt keystore

### Wallet Decryption at Login
- If no keystore exists in `localStorage` → `pendingPassword` is stored in `WalletContext` memory
- `UniversityDashboard` detects `!user.wallet_address` → renders `WalletSetup` component
- If keystore exists → `ethers.Wallet.fromEncryptedJson(keystoreJson, password)` decrypts the wallet
- Decrypted `ethers.Wallet` object lives in `WalletContext` memory for the session

### Protected Routes
- `<ProtectedRoute>` — checks `isLoggedIn` (JWT present + user object in context)
- `<RoleRoute allowedRole="">` — checks `role` matches the route's expected role
- Unauthorized access → redirect to `/login`

### Logout
- Calls `logoutAPI()` → `POST /api/auth/logout`, then clears `localStorage` + context state

---

## 5. Pages

### Public Page (`/`)
- Certificate verification hub — publicly accessible
- **Verify by PDF:** file input → `verifyByFileAPI()` → `POST /api/verify/file`
- **Verify by QR (upload):** file input → `verifyByQrAPI()` → `POST /api/verify/qr`
- **Verify by QR (camera):** uses `window.BarcodeDetector` API for live scanning → captures frame → `POST /api/verify/qr`
- Falls back gracefully if `BarcodeDetector` not supported (prompts QR image upload instead)
- Result states: VALID (green), REVOKED (orange), FAKE (red with distinct "Certificate Does Not Exist" message)
- Download button: functional for file-based verification (uses `URL.createObjectURL()` on the uploaded PDF)

### Login Page (`/login`)
- Calls real backend `POST /api/auth/login`
- Shows backend error details (e.g. "Account is pending approval", "Account is suspended")
- On success: routes to `/admin/dashboard` or `/university/dashboard` based on role

### Register Page (`/register`)
- Calls `registerUniversityAPI()` → `POST /api/universities/register`
- Fields: `university_name`, `country`, `email`, `password`
- On success: shows confirmation, redirects to `/login` after 2s

### Admin Dashboard (`/admin/*`)
- Nested routes: `dashboard`, `pending`, `universities`, `activity`

### University Dashboard (`/university/*`)
- **Wallet gate:** if `user.wallet_address` is null → renders `WalletSetup` instead of normal views
- Nested routes: `dashboard`, `issue`, `certificates`

---

## 6. Components

### Admin

**Dashboard.jsx** — `✅ Complete`
- Fetches real data: pending applications count, registered universities count, suspended count
- Fetches admin stats from `GET /api/universities/stats` — total certs, issued/revoked counts, monthly breakdown
- Line chart (`Certificates Issued per Month`) and pie chart (`Certificate Status`) use real data
- Recent Activity section fetches from `GET /api/activities` (last 5 entries)
- Notifications panel is dynamic (shows pending count, suspended count)

**PendingApplications.jsx** — `✅ Complete`
- Fetches from `GET /api/universities/applications` on mount
- Approve → `PUT /api/universities/applications/{id}/approve`
- Reject → `PUT /api/universities/applications/{id}/reject`
- Removes entry from local list on success (no re-fetch needed)
- Table fields: `university_name`, `country`, `email`, `register_date`

**RegisteredUniversities.jsx** — `✅ Complete`
- Fetches from `GET /api/universities/all_universities` on mount
- Suspend → `PUT /api/universities/{id}/suspend`
- Reactivate → `PUT /api/universities/{id}/reactivate`
- Search filters by `university_name`, `country`, `register_date`
- Table fields: `university_name`, `country`, `status`, `register_date`, `total_certificates`, `wallet_address`
- Inline error banner for action failures (replaces `alert()` calls)

**ActivityLog.jsx** — `✅ Complete`
- Fetches from `GET /api/activities` on mount (up to 100 entries)
- Search by action, target, or actor
- Filter tabs: All, Universities, Certificates
- Action badges: approved (green), rejected (red), suspended (orange), reactivated (green)
- Timestamps formatted with `toLocaleString()`
- Empty state with contextual message

### University

**Dashboard.jsx** — `✅ Complete`
- Fetches from `GET /api/certificates` on mount, computes stats from real data
- Stats: total, valid (status="Issued"), revoked (status="Revoked"), issued this month
- Shows 5 most recent certificates in a table

**WalletSetup.jsx** — `✅ Complete`
- Step 1: `ethers.Wallet.createRandom()` — generates new wallet
- Step 2: `wallet.encrypt(password)` — Keystore V3 JSON, scrypt-hashed (~5s)
- Step 3: Stores keystore JSON in `localStorage` (private key never stored raw)
- Step 4: `registerWalletAPI(wallet.address)` → `PUT /api/universities/me/wallet`
- Step 5: `refreshUser()` — re-fetches `/api/auth/me` to update JWT with wallet address
- After success: `onComplete()` callback is called (UniversityDashboard re-renders to normal view)
- Has manual password fallback input if `pendingPassword` was lost from memory

**IssueCertificate.jsx** — `✅ Complete`
Three-stage flow with stage labels shown to the user:

| Stage | What happens |
|-------|-------------|
| PREPARING | `POST /api/certificates/issue` — backend hashes PDF, uploads to IPFS, returns cert_hash_bytes + encrypted_cid |
| SIGNING | `contract.issueCertificate(cert_hash_bytes, encrypted_cid)` via ethers.js, waits for tx mining |
| CONFIRMING | `POST /api/certificates/{id}/confirm` — backend verifies receipt, sets status="Issued" |

- PDF validation: max 5MB, must be `application/pdf`
- Wallet check: blocks issuance if `wallet === null` (session expired)
- On success: shows QR code image (from `/issue` response) for printing on physical certificate

**IssuedCertificates.jsx** — `✅ Complete`
- Fetches from `GET /api/certificates` on mount
- Search filters by `hashed_certificate`, `student_name`, `issue_date`
- View button → opens `CertificateDetailsModal`
- Revoke button → two-step flow:
  1. `PUT /api/certificates/{id}/revoke` → gets `cert_hash_bytes`
  2. `contract.revokeCertificate(cert_hash_bytes)` via ethers.js, waits for mining
  3. `POST /api/certificates/{id}/revoke/confirm` → backend sets status="Revoked"
- Note: bulk revocation was removed — each revocation requires a separate on-chain signature

**CertificateDetailsModal.jsx** — `✅ Complete`
- Displays all certificate fields: student_name, major, graduation_date, hashed_certificate, status, issue_date, tx_hash, qr_code

### Shared

**ConfirmModal.jsx** — `✅ Complete`
- Props: `isOpen`, `title`, `message`, `confirmLabel`, `confirmVariant` ('red'|'green'|'orange'), `onConfirm`, `onCancel`

**Sidebar.jsx** — `✅ Complete`
- Adapts nav items to `role` ('admin' | 'university')
- Shows `university_name` in the profile section (falls back to email prefix for admins)
- Admin links: Dashboard, Pending Applications, Registered Universities, Activity Log
- University links: Dashboard, Issue Certificate, Issued Certificates

**StatusBadge.jsx** — `✅ Complete`
- Handles: `Issued`, `Revoked`, `Pending`, `PendingRevocation`, `Active`, `Suspended`, `valid`, `invalid`

---

## 7. API Layer (services/api.js)

Axios instance with:
- `baseURL`: `VITE_API_BASE_URL`
- `timeout`: 30s (some IPFS/blockchain endpoints are slow)
- **Request interceptor:** automatically attaches `Authorization: Bearer <token>` header
- **Response interceptor:** on 401 → clears auth data + redirects to `/login`

### Endpoint Map

| Function | Method | Path | Auth |
|----------|--------|------|------|
| `loginAPI(email, password)` | POST | `/api/auth/login` | Public (form-encoded) |
| `getMeAPI()` | GET | `/api/auth/me` | JWT |
| `logoutAPI()` | POST | `/api/auth/logout` | — |
| `registerUniversityAPI(payload)` | POST | `/api/universities/register` | Public |
| `getPendingApplicationsAPI()` | GET | `/api/universities/applications` | Admin |
| `approveApplicationAPI(id)` | PUT | `/api/universities/applications/{id}/approve` | Admin |
| `rejectApplicationAPI(id)` | PUT | `/api/universities/applications/{id}/reject` | Admin |
| `getAllUniversitiesAPI(page, limit)` | GET | `/api/universities/all_universities` | Admin |
| `getUniversityAPI(id)` | GET | `/api/universities/{id}` | Admin |
| `suspendUniversityAPI(id)` | PUT | `/api/universities/{id}/suspend` | Admin |
| `reactivateUniversityAPI(id)` | PUT | `/api/universities/{id}/reactivate` | Admin |
| `registerWalletAPI(walletAddress)` | PUT | `/api/universities/me/wallet` | University |
| `createCertificateAPI(payload)` | POST | `/api/certificates/issue` | University (multipart) |
| `confirmCertificateAPI(id, txHash)` | POST | `/api/certificates/{id}/confirm` | University |
| `listCertificatesAPI()` | GET | `/api/certificates` | University |
| `getCertificateAPI(id)` | GET | `/api/certificates/{id}` | University |
| `revokeCertificateAPI(id)` | PUT | `/api/certificates/{id}/revoke` | University |
| `confirmRevocationAPI(id, txHash)` | POST | `/api/certificates/{id}/revoke/confirm` | University |
| `verifyByFileAPI(pdfFile)` | POST | `/api/verify/file` | Public (multipart) |
| `verifyByQrAPI(qrImageFile)` | POST | `/api/verify/qr` | Public (multipart) |
| `getAdminStatsAPI()` | GET | `/api/universities/stats` | Admin |
| `getActivitiesAPI(page, limit)` | GET | `/api/activities` | Admin |

---

## 8. Wallet & Blockchain Integration

The frontend handles all on-chain signing. The backend never sees private keys.

### WalletContext
- `wallet` — `ethers.Wallet` instance (null until `loadWallet()` succeeds)
- `loadWallet(password)` — decrypts keystore from `localStorage` using ethers.js scrypt
- `clearWallet()` — called on logout
- `pendingPassword` — plaintext password held in memory briefly after login, consumed by `WalletSetup`

### On-chain Signing Pattern (IssueCertificate / IssuedCertificates)
```javascript
const provider = new ethers.JsonRpcProvider(VITE_POLYGON_RPC_URL);
const connectedWallet = wallet.connect(provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, TrustChainABI, connectedWallet);
const tx = await contract.issueCertificate(cert_hash_bytes, encrypted_cid);
await tx.wait(); // wait for mining
// then call /confirm with tx.hash
```

### Environment Variables Required
```
VITE_CONTRACT_ADDRESS    — deployed TrustChain contract address on Polygon Amoy
VITE_POLYGON_RPC_URL     — https://rpc-amoy.polygon.technology
VITE_API_BASE_URL        — backend URL (e.g. http://localhost:8000)
```

---

## 9. Theme System

Fully implemented light/dark mode via CSS custom properties on `data-theme` attribute.

**Light mode (`data-theme="light"`):**
- `--primary`: `#2A52A0`
- `--bg-app`: `#EEF2FF`
- `--bg-card`: `#FFFFFF`
- `--text-primary`: `#0D1B3E`

**Dark mode (`data-theme="dark"`):**
- `--primary`: `#3B82F6`
- `--bg-app`: `#0A1628`
- `--bg-card`: `#0F2044`
- `--text-primary`: `#E8EEFF`

---

## 10. What's Done vs What's Left

### ✅ Complete
- [x] All API calls wired to real backend (no mock data in use)
- [x] JWT auth with automatic header injection and 401 redirect
- [x] Wallet generation, keystore encryption, and decryption at login
- [x] Full certificate issuance flow (3-step: backend → ethers.js sign → confirm)
- [x] Full certificate revocation flow (2-step: backend → ethers.js sign → confirm)
- [x] Public verification by PDF upload
- [x] Public verification by QR image upload
- [x] Live camera QR scanning (with graceful fallback for unsupported browsers)
- [x] Admin: pending applications manage (approve/reject)
- [x] Admin: registered universities manage (suspend/reactivate)
- [x] All loading/error/empty states across all components
- [x] Light/dark theme system
- [x] Protected + role-based routing

### ⬜ Remaining
- [ ] **`certificateService.js` cleanup** — legacy file, no longer used, should be removed
- [ ] **`mockData.js` cleanup** — data file no longer imported anywhere, should be removed

---

## 11. Known Issues & Bugs

| Issue | Severity | Details |
|-------|----------|---------|
| `certificateService.js` never used | 🟢 Low | Legacy file that duplicates functionality already in `api.js` |
| `mockData.js` never imported | 🟢 Low | File remains in `src/data/` but nothing imports it |
| Camera QR scan — limited browser support | 🟢 Low | `window.BarcodeDetector` is not available in Firefox. App gracefully falls back to file upload |

---

*TrustChain Frontend | May 2026*