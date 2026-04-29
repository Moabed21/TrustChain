# TrustChain — Full API Documentation
### Base URL: `http://127.0.0.1:8000`
### Updated: April 28, 2026

---

## Table of Contents
1. [Auth Router](#1-auth-router)
2. [Universities Router](#2-universities-router)
3. [Certificates Router](#3-certificates-router)
4. [Verify Router](#4-verify-router)

---

## Router Overview

| Router | File | Prefix | Endpoints | Status |
|--------|------|--------|-----------|--------|
| Auth | `app/routers/auth.py` | `/api/auth` | 3 |  Done |
| Universities | `app/routers/universities.py` | `/api/universities` | 9 |  Done |
| Certificates | `app/routers/certificates.py` | `/api/certificates` | 6 |  Done |
| Verify | `app/routers/verify.py` | `/api/verify` | 3 |  Done |
| **Total** | | | **21** | |

---

# 1. Auth Router
### File: `app/routers/auth.py`
### Prefix: `/api/auth`
### Status:  Done

---

## POST `/api/auth/login`
### Status:  Done

**Purpose:**
Authenticates a user (admin or university) and returns a JWT access token.

**Access:** Public — no token required

**Who Uses It:**
- Admin logging into admin dashboard
- University logging into university portal

**Internal Flow:**
```
1. Receive username (email) and password from form data
2. Search db.users collection for the email (admin lives here)
3. If not found → search db.universities collection
4. If still not found → return 401
5. If found → check account status
   → status == "Pending"   → return 403
   → status == "Suspended" → return 403
6. Verify password against hashed_password in MongoDB
7. If wrong → return 401
8. If correct → create JWT token containing:
   - sub (MongoDB user _id)
   - email
   - role
   - wallet_address (null if not connected yet)
   - exp (expiry time)
9. Return token + role + email to frontend
```

**Request:**
```
Type: Form Data (NOT JSON)
Fields:
  username: string  ← this is the email
  password: string
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "admin",
  "email": "admin@trustchain.com"
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 401 | Email not found in any collection |
| 401 | Password is incorrect |
| 403 | Account status is Pending |
| 403 | Account status is Suspended |

**Why 401 vs 403:**
```
401 → we do not know who you are (identity problem)
403 → we know who you are but you cannot come in (permission problem)
```

---

## GET `/api/auth/me`
### Status:  Done

**Purpose:**
Returns the currently logged in user's information based on their JWT token.

**Access:** Any logged in user (admin or university)

**Who Uses It:**
- Frontend to display logged in user info
- Frontend to verify token is still valid

**Internal Flow:**
```
1. Extract Bearer token from Authorization header
2. Decode JWT token using secret key
3. Get user_id from token payload (sub field)
4. Search db.users with user_id (check admin first)
5. If not found → search db.universities
6. If still not found → return 401
7. Return user info (no password fields)
```

**Request:**
```
Headers:
  Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "64abc123def456789012",
  "email": "admin@trustchain.com",
  "role": "admin",
  "status": null,
  "wallet_address": null
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 401 | Token missing |
| 401 | Token invalid or expired |

---

## POST `/api/auth/logout`
### Status:  Done

**Purpose:**
Confirms logout. Since JWT is stateless, actual logout is handled by frontend deleting the token.

**Access:** Any logged in user

**Internal Flow:**
```
1. Receive request (token not actually needed here)
2. Return success message
3. Frontend deletes stored token on its side
```

**Request:**
```
Headers:
  Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

> **Important Note for Frontend:**
> After calling this endpoint, frontend must:
> ```javascript
> localStorage.removeItem("token")
> localStorage.removeItem("role")
> // then redirect to login page
> ```

---

# 2. Universities Router
### File: `app/routers/universities.py`
### Prefix: `/api/universities`
### Status:  Done

---

## POST `/api/universities/register`
### Status:  Done

**Purpose:**
Allows a university to submit a registration application. Application goes into a pending state until admin approves or rejects it.

**Access:** Public — no token required

**Who Uses It:**
- Any university wanting to join TrustChain

**Internal Flow:**
```
1. Receive university data from request body
2. Check if email already exists in db.applications
   → if yes → return 400 (already applied)
3. Check if email already exists in db.universities
   → if yes → return 400 (already registered)
4. Hash the password using bcrypt
5. Build application document:
   - university_name, country, official_email
   - hashed_password
   - status = "Pending"
   - register_date = now (UTC)
   - certificates_issued = 0
   - role = "university"
   - wallet_address = null (connected later after approval)
6. Save to db.applications collection
7. Return success message
```

**Request:**
```json
{
  "university_name": "University of Jordan",
  "country": "Jordan",
  "official_email": "admin@uj.edu.jo",
  "password": "securepass123"
}
```

> **Note:** wallet_address is NOT part of registration.
> It is connected after approval via MetaMask.

**Response:**
```json
{
  "message": "Application submitted successfully, waiting for admin approval"
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 400 | Email already submitted in a pending application |
| 400 | University already registered with this email |

---

## GET `/api/universities/applications`
### Status:  Done

**Purpose:**
Returns all pending university registration applications for admin to review.

**Access:** Admin only

**Who Uses It:**
- Admin dashboard to show pending applications

**Internal Flow:**
```
1. Verify JWT token → is this admin?
   → if not admin → return 403
2. Search db.applications where status == "Pending"
3. Convert all _id ObjectId fields to strings
4. Return list of applications
```

**Request:**
```
Headers:
  Authorization: Bearer <admin_access_token>
```

**Response:**
```json
[
  {
    "_id": "64abc123def456789012",
    "university_name": "University of Jordan",
    "country": "Jordan",
    "official_email": "admin@uj.edu.jo",
    "status": "Pending",
    "register_date": "2026-03-30T10:00:00.000Z",
    "certificates_issued": 0,
    "wallet_address": null,
    "role": "university"
  }
]
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 401 | Token missing or invalid |
| 403 | Not admin |

---

## PUT `/api/universities/applications/{id}/approve`
### Status:  Done

**Purpose:**
Admin approves a pending university application. Moves university from applications collection to universities collection with Active status.

**Access:** Admin only

**Who Uses It:**
- Admin clicking Approve on a pending application

**Internal Flow:**
```
1. Verify JWT token → is this admin?
   → if not admin → return 403
2. Find application in db.applications by id
   → if not found → return 404
3. Build university document from application data:
   - copy all fields
   - set status = "Active"
   - set wallet_address = null (not connected yet)
4. Insert document into db.universities
5. Delete document from db.applications
6. Return success message
```

**Request:**
```
Headers:
  Authorization: Bearer <admin_access_token>

URL:
  PUT /api/universities/applications/64abc123def456789012/approve
```

**Response:**
```json
{
  "message": "University approved successfully"
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 401 | Token missing or invalid |
| 403 | Not admin |
| 404 | Application not found |

**What Happens in MongoDB:**
```
Before:
  db.applications → { _id: "64abc123", status: "Pending", ... }
  db.universities → (nothing)

After:
  db.applications → (deleted)
  db.universities → { _id: "new_id", status: "Active", ... }
```

---

## PUT `/api/universities/applications/{id}/reject`
### Status:  Done

**Purpose:**
Admin rejects a pending university application. Application stays in db.applications with Rejected status for audit purposes.

**Access:** Admin only

**Who Uses It:**
- Admin clicking Reject on a pending application

**Internal Flow:**
```
1. Verify JWT token → is this admin?
   → if not admin → return 403
2. Find application in db.applications by id
   → if not found → return 404
3. Update status to "Rejected" in db.applications
   (keep for record, do not delete)
4. Return success message
```

**Request:**
```
Headers:
  Authorization: Bearer <admin_access_token>

URL:
  PUT /api/universities/applications/64abc123def456789012/reject
```

**Response:**
```json
{
  "message": "Application rejected"
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 401 | Token missing or invalid |
| 403 | Not admin |
| 404 | Application not found |

**Why We Keep Rejected Applications:**
```
Unlike approved applications which get deleted,
rejected ones stay in db.applications with status "Rejected"
so admin has a record of all past decisions
```

---

## GET `/api/universities/{id}`
### Status:  Done

**Purpose:**
Returns full details of a specific university by its MongoDB ID.

**Access:** Admin only

**Who Uses It:**
- Admin viewing university details page

**Internal Flow:**
```
1. Verify JWT token → is this admin?
   → if not admin → return 403
2. Find university in db.universities by id
   → if not found → return 404
3. Convert _id to string
4. Return university document
```

**Request:**
```
Headers:
  Authorization: Bearer <admin_access_token>

URL:
  GET /api/universities/64abc123def456789012
```

**Response:**
```json
{
  "_id": "64abc123def456789012",
  "university_name": "University of Jordan",
  "country": "Jordan",
  "official_email": "admin@uj.edu.jo",
  "status": "Active",
  "register_date": "2026-03-30T10:00:00.000Z",
  "certificates_issued": 12,
  "wallet_address": "0x742d35Cc6634C0532925a3b8D4C9b5690",
  "role": "university"
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 401 | Token missing or invalid |
| 403 | Not admin |
| 404 | University not found |

---

## PUT `/api/universities/{id}/suspend`
### Status:  Done

**Purpose:**
Admin suspends an active university. Suspended universities cannot login.

**Access:** Admin only

**Who Uses It:**
- Admin suspending a university that violated rules

**Internal Flow:**
```
1. Verify JWT token → is this admin?
   → if not admin → return 403
2. Find university in db.universities by id
   → if not found → return 404
3. Check current status
   → if already "Suspended" → return 400
4. Update status to "Suspended" in db.universities
5. Return success message
```

**Request:**
```
Headers:
  Authorization: Bearer <admin_access_token>

URL:
  PUT /api/universities/64abc123def456789012/suspend
```

**Response:**
```json
{
  "message": "University suspended successfully"
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 401 | Token missing or invalid |
| 403 | Not admin |
| 404 | University not found |
| 400 | University is already suspended |

**Effect on University Login:**
```
After suspension:
  University tries to login
  → auth.py checks status == "Suspended"
  → returns 403 "Account is suspended"
  → university cannot access the system
```

---

## PUT `/api/universities/{id}/reactivate`
### Status:  Done

**Purpose:**
Admin reactivates a suspended university. University can login again after reactivation.

**Access:** Admin only

**Who Uses It:**
- Admin reactivating a previously suspended university

**Internal Flow:**
```
1. Verify JWT token → is this admin?
   → if not admin → return 403
2. Find university in db.universities by id
   → if not found → return 404
3. Check current status
   → if already "Active" → return 400
4. Update status to "Active" in db.universities
5. Return success message
```

**Request:**
```
Headers:
  Authorization: Bearer <admin_access_token>

URL:
  PUT /api/universities/64abc123def456789012/reactivate
```

**Response:**
```json
{
  "message": "University reactivated successfully"
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 401 | Token missing or invalid |
| 403 | Not admin |
| 404 | University not found |
| 400 | University is already active |

---

## PUT `/api/universities/me/wallet`
### Status:  Done

**Purpose:**
Registers a university's MetaMask wallet address. Called once on first login after approval. Also funds the wallet with test MATIC and registers it on the smart contract.

**Access:** University only (must be Active)

**Who Uses It:**
- University portal on first login — frontend detects `wallet_address == null` and prompts MetaMask connection

**Internal Flow:**
```
1. Verify JWT token → is this a university?
   → if not university → return 403
2. Check if wallet already registered for this university
   → if yes → return 400 (already set)
3. Validate wallet address format using Web3.is_address()
   → if invalid → return 400
4. Convert to EIP-55 checksum format
5. Check db.universities for duplicate wallet address
   → if another university uses this wallet → return 400
6. Save wallet_address to university document in MongoDB
7. Fund the wallet: send MATIC from admin wallet → university wallet
   → if funding fails → continue (admin can fund manually later)
8. Register wallet on smart contract: registerUniversity(address)
   → if registration fails → continue (admin can register manually later)
9. Return result with funding and registration status
```

**Request:**
```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b8D4C9b5690"
}
```

**Response:**
```json
{
  "message": "Wallet address registered successfully",
  "wallet_address": "0x742d35Cc6634C0532925a3b8D4C9b5690",
  "funded": true,
  "funding_tx_hash": "0xabc123...",
  "registered_on_chain": true,
  "registration_tx_hash": "0xdef456..."
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 401 | Token missing or invalid |
| 403 | Not a university |
| 400 | Wallet already registered for this university |
| 400 | Invalid wallet address format |
| 400 | Wallet address already used by another university |

**Why Funding and On-Chain Registration Can Fail Silently:**
```
Both are external blockchain calls that may fail (RPC down, insufficient admin balance, etc.)
The wallet address is still saved in MongoDB so admin can retry manually.
Frontend receives funded: false or registered_on_chain: false to show a warning.
```

---

## GET `/api/universities/all_universities`
### Status:  Done

**Purpose:**
Returns all registered universities for the admin dashboard. Supports pagination to prevent overloading the response with too many records.

**Access:** Admin only

**Who Uses It:**
- Admin dashboard — the "Manage Universities" page that lists all universities with suspend/reactivate actions

**Internal Flow:**
```
1. Verify JWT token → is this admin?
   → if not admin → return 403
2. Calculate skip = (page - 1) * limit
   → page 1 → skip 0 (first 100)
   → page 2 → skip 100 (universities 101-200)
3. Query db.universities with skip() and limit()
4. Convert all _id ObjectId fields to strings
5. Return list (empty [] if no universities — not an error)
```

**Request:**
```
Headers:
  Authorization: Bearer <admin_access_token>

URL:
  GET /api/universities/all_universities?page=1&limit=100

Query Parameters:
  page:  integer (default: 1)   — which page to return
  limit: integer (default: 100) — how many per page
```

**Response:**
```json
[
  {
    "_id": "64abc123def456789012",
    "university_name": "University of Jordan",
    "country": "Jordan",
    "email": "admin@uj.edu.jo",
    "status": "Active",
    "register_date": "2026-03-30T10:00:00.000Z",
    "total_certificates": 12,
    "wallet_address": "0x742d35Cc6634C0532925a3b8D4C9b5690",
    "role": "university"
  },
  {
    "_id": "64def456abc789012345",
    "university_name": "PSUT",
    "country": "Jordan",
    "email": "admin@psut.edu.jo",
    "status": "Suspended",
    "register_date": "2026-04-01T12:00:00.000Z",
    "total_certificates": 3,
    "wallet_address": "0x123abc456def789012345678901234567890abcd",
    "role": "university"
  }
]
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 401 | Token missing or invalid |
| 403 | Not admin |

**Pagination Example:**
```
Page 1: GET /api/universities/all_universities?page=1&limit=100 → universities 1-100
Page 2: GET /api/universities/all_universities?page=2&limit=100 → universities 101-200
Page 3: GET /api/universities/all_universities?page=3&limit=100 → universities 201-300

If fewer than `limit` results are returned, you've reached the last page.
```

---

# 3. Certificates Router
### File: `app/routers/certificates.py`
### Prefix: `/api/certificates`
### Status:  Done

---

## POST `/api/certificates`
### Status:  Done

**Purpose:**
Prepares a new certificate for a student. Returns data for frontend to sign on-chain.

**Access:** University only (must be Active and have wallet connected)

**Internal Flow:**
```
1. Verify JWT token → is this a university?
2. Check university status → must be "Active"
3. Validate wallet is registered on-chain
4. Hash certificate data using SHA-256
5. Check db.certificates for duplicate hash
   → if exists → return 400 (already issued)
6. Encrypt PDF using AES-256-GCM
7. Upload encrypted PDF to IPFS via Pinata
8. Encrypt the CID using AES-256-GCM
9. Generate QR code containing encrypted CID
10. Save to db.certificates with status "Pending"
11. Return QR code + certificate details for signing
```

**Request:**
```
Headers:
  Authorization: Bearer <university_access_token>
  Content-Type: multipart/form-data

Body:
  student_name: string
  major: string
  graduation_date: string
  pdf: PDF file (the certificate)
```

**Response:**
```json
{
  "message": "Certificate prepared sign the transaction onchain to complete issuance",
  "certificate_id": "64abc123",
  "cert_hash_bytes": "0xa3f8c2d1e9b7...",
  "encrypted_cid": "U2FsdGVkX1...",
  "qr_code": "base64_encoded_qr_image"
}
```

---

## POST `/api/certificates/{certificate_id}/confirm`
### Status:  Done

**Purpose:**
Confirms issuance after frontend signs transaction on blockchain. Updates status to Issued.

**Access:** University only

**Internal Flow:**
```
1. Verify JWT token
2. Find certificate by id, ensure status is "Pending"
3. Verify transaction receipt on-chain using tx_hash
4. Validate tx was signed by university's wallet
5. Update certificate status to "Issued", record tx_hash
6. Increment university total_certificates
```

**Request:**
```json
{
  "tx_hash": "0x123abc..."
}
```

**Response:**
```json
{
  "message": "Certificate issued successfully and recorded on blockchain",
  "certificate_id": "64abc123",
  "tx_hash": "0x123abc...",
  "status": "Issued"
}
```

---

## GET `/api/certificates`
### Status:  Done

**Purpose:**
Returns all certificates issued by the currently logged in university.

**Access:** University only

**Internal Flow:**
```
1. Verify JWT token
2. Search db.certificates where university_id matches (limit 100)
3. Return list of certificates
```

**Response:**
```json
[
  {
    "_id": "64abc123",
    "student_name": "Ahmed Ali",
    "major": "Computer Science",
    "graduation_date": "2026-06-01",
    "status": "Issued",
    "issue_date": "2026-04-20T10:00:00.000Z"
  }
]
```

---

## GET `/api/certificates/{id}`
### Status:  Done

**Purpose:**
Returns full details of a specific certificate.

**Access:** University only (must be the university that issued it)

**Response:**
```json
{
  "_id": "64abc123",
  "student_name": "Ahmed Ali",
  "major": "Computer Science",
  "graduation_date": "2026-06-01",
  "university_id": "64xyz789",
  "hashed_certificate": "a3f8c2d1...",
  "enc_cid": "U2FsdGVkX1...",
  "status": "Issued",
  "issue_date": "2026-04-20T10:00:00.000Z",
  "tx_hash": "0x123abc..."
}
```

---

## PUT `/api/certificates/{id}/revoke`
### Status:  Done

**Purpose:**
Initiates revocation of a certificate. Marks it as PendingRevocation.

**Access:** University only (must be the university that issued it)

**Internal Flow:**
```
1. Verify JWT token and wallet registration
2. Find certificate, ensure status is "Issued"
3. Update status to "PendingRevocation"
4. Return hash bytes for frontend to call revokeCertificate on-chain
```

**Response:**
```json
{
  "message": "Certificate marked for revocation — sign the transaction on chain to complete",
  "certificate_id": "64abc123",
  "cert_hash_bytes": "0xa3f8c2d1..."
}
```

---

## POST `/api/certificates/{id}/revoke/confirm`
### Status:  Done

**Purpose:**
Confirms revocation after frontend signs transaction on blockchain.

**Access:** University only

**Internal Flow:**
```
1. Verify JWT token
2. Find certificate, ensure status is "PendingRevocation"
3. Verify transaction receipt on-chain
4. Update status to "Revoked"
```

**Request:**
```json
{
  "tx_hash": "0x456def..."
}
```

**Response:**
```json
{
  "message": "Certificate revoked successfully",
  "certificate_id": "64abc123",
  "tx_hash": "0x456def...",
  "status": "Revoked"
}
```


---

# 4. Verify Router
### File: `app/routers/verify.py`
### Prefix: `/api/verify`
### Status:  Done

---

## GET `/api/verify`
### Status:  Done

**Purpose:**
Health check for verify router.

**Access:** Public

**Response:**
```json
{
  "message": "verify router is working"
}
```

---

## POST `/api/verify/file`
### Status:  Done

**Purpose:**
Verifies a certificate by uploading the PDF file directly.

**Access:** Public — no token required

**Internal Flow:**
```
1. Read uploaded PDF bytes
2. Hash PDF using SHA-256
3. Query Polygon blockchain: verifyCertificate(cert_hash)
4. Return verification metadata (status, issuer, timestamp)
```

**Request:**
```
Content-Type: multipart/form-data
Body:
  pdf: PDF file
```

**Response - Valid:**
```json
{
  "certificate_hash": "a3f8c2d1...",
  "status": "valid",
  "issuer": "0x742d35...",
  "timestamp": 1714318000
}
```

---

## POST `/api/verify/qr`
### Status:  Done

**Purpose:**
Verifies a certificate by scanning its QR code image.

**Access:** Public — no token required

**Internal Flow:**
```
1. Receive QR code image file
2. Decode QR code to extract encrypted_cid
3. Decrypt CID using AES-256
4. Fetch encrypted PDF from IPFS
5. Decrypt PDF using AES-256
6. Hash PDF using SHA-256
7. Query Polygon blockchain with the hash
8. Return verification metadata
```

**Request:**
```
Content-Type: multipart/form-data
Body:
  qr_image: Image file (PNG/JPG)
```

**Response - Valid:**
```json
{
  "certificate_hash": "a3f8c2d1...",
  "status": "valid",
  "issuer": "0x742d35...",
  "timestamp": 1714318000
}
```


---

# Middleware
### File: `app/middleware/auth_middleware.py`
### Status:  Done

| Function | Purpose | Used In |
|----------|---------|---------|
| `get_current_user()` | Decodes JWT, returns logged in user | `/me`, all protected endpoints |
| `require_admin()` | Calls get_current_user + checks role == admin | All university management endpoints |
| `require_university()` | Calls get_current_user + checks role == university | All certificate endpoints |

---

# Services
### Status:  Done

| Service | File | Purpose | Planned |
|---------|------|---------|---------|
| Hashing | `services/hashing.py` | SHA-256 certificate hashing | Session 10 - Apr 13 |
| Encryption | `services/encryption.py` | AES-256 encrypt/decrypt PDF and CID | Session 10 - Apr 13 |
| IPFS | `services/ipfs.py` | Upload/fetch PDF via Pinata | Session 11 - Apr 15 |
| QR | `services/qr.py` | Generate and decode QR codes | Session 12 - Apr 17 |
| Blockchain | `services/blockchain.py` | Web3.py connection to Polygon | Session 9 - Apr 10 |

---

# Smart Contract
### File: `contracts/TrustChain.sol`
### Status:  Done

| Function | Purpose | Access |
|----------|---------|--------|
| `registerUniversity(address wallet)` | Register approved university wallet | Admin only |
| `issueCertificate(hash, cid)` | Record certificate on blockchain | University only |
| `revokeCertificate(hash)` | Mark certificate as revoked | University only |
| `verifyCertificate(hash)` | Check certificate status | Public |

---

# Complete Status Summary

| # | Endpoint | Router | Access | Status |
|---|----------|--------|--------|--------|
| 1 | POST `/api/auth/login` | auth.py | Public |  Done |
| 2 | GET `/api/auth/me` | auth.py | Any logged in |  Done |
| 3 | POST `/api/auth/logout` | auth.py | Any logged in |  Done |
| 4 | POST `/api/universities/register` | universities.py | Public |  Done |
| 5 | GET `/api/universities/applications` | universities.py | Admin |  Done |
| 6 | PUT `/api/universities/applications/{id}/approve` | universities.py | Admin |  Done |
| 7 | PUT `/api/universities/applications/{id}/reject` | universities.py | Admin |  Done |
| 8 | GET `/api/universities/{id}` | universities.py | Admin |  Done |
| 9 | PUT `/api/universities/{id}/suspend` | universities.py | Admin |  Done |
| 10 | PUT `/api/universities/{id}/reactivate` | universities.py | Admin |  Done |
| 11 | PUT `/api/universities/me/wallet` | universities.py | University |  Done |
| 12 | GET `/api/universities/all_universities` | universities.py | Admin |  Done |
| 13 | POST `/api/certificates` | certificates.py | University |  Done |
| 14 | POST `/api/certificates/{id}/confirm` | certificates.py | University |  Done |
| 15 | GET `/api/certificates` | certificates.py | University |  Done |
| 16 | GET `/api/certificates/{id}` | certificates.py | University |  Done |
| 17 | PUT `/api/certificates/{id}/revoke` | certificates.py | University |  Done |
| 18 | POST `/api/certificates/{id}/revoke/confirm` | certificates.py | University |  Done |
| 19 | GET `/api/verify` | verify.py | Public |  Done |
| 20 | POST `/api/verify/file` | verify.py | Public |  Done |
| 21 | POST `/api/verify/qr` | verify.py | Public |  Done |


---

# How To Use The Token

```javascript
// Store after login
const response = await axios.post("/api/auth/login", formData)
localStorage.setItem("token", response.data.access_token)
localStorage.setItem("role", response.data.role)

// Send with every protected request
axios.get("/api/auth/me", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
})

// Delete on logout
localStorage.removeItem("token")
localStorage.removeItem("role")
```

---

# Role Based Routing (Frontend)

```javascript
// After login redirect based on role
if (role === "admin") {
  navigate("/admin/dashboard")
} else if (role === "university") {
  navigate("/university/dashboard")
}
```

---