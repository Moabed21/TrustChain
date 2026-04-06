# TrustChain — Full API Documentation
### Base URL: `http://127.0.0.1:8000`
### Updated: March 30, 2026

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
| Universities | `app/routers/universities.py` | `/api/universities` | 7 |  Done |
| Certificates | `app/routers/certificates.py` | `/api/certificates` | 5 |  Not Started |
| Verify | `app/routers/verify.py` | `/api/verify` | 2 |  Not Started |
| **Total** | | | **17** | |

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

# 3. Certificates Router
### File: `app/routers/certificates.py`
### Prefix: `/api/certificates`
### Status:  Not Started (Planned: Session 13-15, Apr 20-24)

---

## POST `/api/certificates`
### Status:  Not Started

**Purpose:**
Issues a new certificate for a student. Most complex endpoint in the system.

**Access:** University only (must be Active and have wallet connected)

**Internal Flow:**
```
1.  Verify JWT token → is this a university?
2.  Check university status → must be "Active"
3.  Validate all input fields
4.  Hash certificate data using SHA-256
    Input: student_name + major + graduation_date + university_id
    Output: unique certificate fingerprint
5.  Check db.certificates for duplicate hash
    → if exists → return 400 (already issued)
6.  Encrypt PDF using AES-256
7.  Upload encrypted PDF to IPFS via Pinata
    Output: CID (content identifier)
8.  Encrypt the CID using AES-256
9.  Write to Polygon blockchain:
    issueCertificate(certificate_hash, encrypted_cid)
    University wallet signs the transaction
10. Generate QR code containing encrypted CID
11. Save to db.certificates
12. Increment university certificates_issued counter
13. Return QR code + certificate details
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
  file: PDF file (the certificate)
```

**Response:**
```json
{
  "id": "64abc123",
  "certificate_hash": "a3f8c2d1e9b7...",
  "qr_code": "base64_encoded_qr_image",
  "status": "valid",
  "issue_date": "2026-04-20T10:00:00.000Z",
  "message": "Certificate issued successfully"
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 401 | Token missing or invalid |
| 403 | Not a university |
| 403 | University not active |
| 400 | Certificate already issued (duplicate hash) |
| 400 | Wallet not connected |

---

## GET `/api/certificates`
### Status:  Not Started

**Purpose:**
Returns all certificates issued by the currently logged in university.

**Access:** University only

**Internal Flow:**
```
1. Verify JWT token → get university_id
2. Search db.certificates where university_id matches
3. Convert _id fields to strings
4. Return list of certificates
```

**Request:**
```
Headers:
  Authorization: Bearer <university_access_token>
```

**Response:**
```json
[
  {
    "_id": "64abc123",
    "student_name": "Ahmed Ali",
    "major": "Computer Science",
    "graduation_date": "2026-06-01",
    "certificate_hash": "a3f8c2d1...",
    "status": "valid",
    "issue_date": "2026-04-20T10:00:00.000Z",
    "qr_code": "base64..."
  }
]
```

---

## GET `/api/certificates/{id}`
### Status:  Not Started

**Purpose:**
Returns full details of a specific certificate.

**Access:** University only (must be the university that issued it)

**Internal Flow:**
```
1. Verify JWT token → get university_id
2. Find certificate in db.certificates by id
   → if not found → return 404
3. Check certificate belongs to this university
   → if not → return 403
4. Return certificate details
```

**Request:**
```
Headers:
  Authorization: Bearer <university_access_token>

URL:
  GET /api/certificates/64abc123def456789012
```

**Response:**
```json
{
  "_id": "64abc123",
  "student_name": "Ahmed Ali",
  "major": "Computer Science",
  "graduation_date": "2026-06-01",
  "university_id": "64xyz789",
  "certificate_hash": "a3f8c2d1...",
  "ipfs_cid": "QmX7y8z9...",
  "status": "valid",
  "issue_date": "2026-04-20T10:00:00.000Z",
  "qr_code": "base64..."
}
```

---

## PUT `/api/certificates/{id}/revoke`
### Status:  Not Started

**Purpose:**
Revokes a certificate. Marks it as revoked on the blockchain and in MongoDB. PDF stays on IPFS but verification will fail.

**Access:** University only (must be the university that issued it)

**Internal Flow:**
```
1. Verify JWT token → get university_id
2. Find certificate in db.certificates by id
   → if not found → return 404
3. Check certificate belongs to this university
   → if not → return 403
4. Check certificate is not already revoked
   → if revoked → return 400
5. Call smart contract:
   revokeCertificate(certificate_hash)
6. Update db.certificates status to "revoked"
7. Return success message
```

**Request:**
```
Headers:
  Authorization: Bearer <university_access_token>

URL:
  PUT /api/certificates/64abc123def456789012/revoke
```

**Response:**
```json
{
  "message": "Certificate revoked successfully"
}
```

**Error Responses:**
| Code | Reason |
|------|--------|
| 401 | Token missing or invalid |
| 403 | Not a university |
| 403 | Certificate belongs to another university |
| 404 | Certificate not found |
| 400 | Certificate already revoked |

---

## GET `/api/certificates/{id}/download`
### Status:  Not Started

**Purpose:**
Downloads the original PDF certificate by fetching it from IPFS and decrypting it.

**Access:** University only (must be the university that issued it)

**Internal Flow:**
```
1. Verify JWT token → get university_id
2. Find certificate in db.certificates
3. Check certificate belongs to this university
4. Get ipfs_cid from certificate document
5. Fetch encrypted PDF from IPFS using CID
6. Decrypt PDF using AES-256
7. Return PDF file as download
```

**Request:**
```
Headers:
  Authorization: Bearer <university_access_token>

URL:
  GET /api/certificates/64abc123def456789012/download
```

**Response:**
```
Content-Type: application/pdf
File: decrypted PDF bytes
```

---

# 4. Verify Router
### File: `app/routers/verify.py`
### Prefix: `/api/verify`
### Status:  Not Started (Planned: Session 16-18, Apr 27 - May 1)

---

## POST `/api/verify`
### Status:  Not Started

**Purpose:**
Verifies a certificate by its hash. Used when someone has the certificate hash directly.

**Access:** Public — no token required

**Who Uses It:**
- Employers or institutions verifying a certificate hash

**Internal Flow:**
```
1. Receive certificate_hash from request
2. Query Polygon blockchain:
   verifyCertificate(certificate_hash)
3. Blockchain returns:
   - exists: true/false
   - status: "valid" or "revoked"
   - issuer_wallet
   - timestamp
4. If not exists → return invalid
5. If revoked → return revoked
6. If valid → fetch details from db.certificates
7. Return full result
```

**Request:**
```json
{
  "certificate_hash": "a3f8c2d1e9b7..."
}
```

**Response - Valid:**
```json
{
  "status": "valid",
  "student_name": "Ahmed Ali",
  "major": "Computer Science",
  "graduation_date": "2026-06-01",
  "university_name": "University of Jordan",
  "issue_date": "2026-04-20T10:00:00.000Z"
}
```

**Response - Revoked:**
```json
{
  "status": "revoked",
  "message": "This certificate has been revoked by the issuing university"
}
```

**Response - Invalid:**
```json
{
  "status": "invalid",
  "message": "This certificate does not exist on the blockchain"
}
```

---

## POST `/api/verify/qr`
### Status:  Not Started

**Purpose:**
Verifies a certificate by scanning its QR code. Main verification method for employers.

**Access:** Public — no token required

**Who Uses It:**
- Employers scanning QR code on a physical or digital certificate

**Internal Flow:**
```
1. Receive encrypted_cid from QR code scan
2. Decrypt the encrypted_cid using AES-256
   Output: real IPFS CID
3. Fetch encrypted PDF from IPFS using CID
4. Decrypt the PDF using AES-256
5. Hash the certificate data using SHA-256
6. Query Polygon blockchain with the hash:
   verifyCertificate(certificate_hash)
7. Blockchain returns status
8. If not exists → return invalid
9. If revoked → return revoked
10. If valid → return certificate details
```

**Request:**
```json
{
  "encrypted_cid": "U2FsdGVkX1+abc123..."
}
```

**Response - Valid:**
```json
{
  "status": "valid",
  "student_name": "Ahmed Ali",
  "major": "Computer Science",
  "graduation_date": "2026-06-01",
  "university_name": "University of Jordan",
  "issue_date": "2026-04-20T10:00:00.000Z"
}
```

**Response - Revoked:**
```json
{
  "status": "revoked",
  "message": "This certificate has been revoked by the issuing university"
}
```

**Response - Invalid/Tampered:**
```json
{
  "status": "invalid",
  "message": "This certificate does not exist or has been tampered with"
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
### Status:  Not Started (Planned: Week 4, Apr 13-17)

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
### Status:  Not Started (Planned: Week 3, Apr 6-10)

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
| 11 | POST `/api/certificates` | certificates.py | University |  Not Started |
| 12 | GET `/api/certificates` | certificates.py | University |  Not Started |
| 13 | GET `/api/certificates/{id}` | certificates.py | University |  Not Started |
| 14 | PUT `/api/certificates/{id}/revoke` | certificates.py | University |  Not Started |
| 15 | GET `/api/certificates/{id}/download` | certificates.py | University |  Not Started |
| 16 | POST `/api/verify` | verify.py | Public |  Not Started |
| 17 | POST `/api/verify/qr` | verify.py | Public |  Not Started |

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