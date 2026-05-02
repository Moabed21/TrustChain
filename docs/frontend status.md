# TrustChain  Frontend Documentation

## 1. Project Overview
**What is TrustChain:**
TrustChain is a decentralized Blockchain-based Academic Certificate Verification System. It allows universities to autonomously issue and revoke academic certificates while providing a public-facing portal for global certificate verification.

**Tech Stack:**
- **Framework:** React 18, Vite
- **Routing:** React Router DOM
- **State Management:** React Context API & `useState` hook (currently using local mock data)
- **Styling:** Vanilla CSS tightly integrated with custom global custom variables for light/dark mode themes.
- **Data Visualization:** Recharts
- **Icons:** Lucide React

**How to run the project:**
```bash
npm install
npm run dev
```

**Login credentials for testing:**
- **System Admin:** `admin@trustchain.com` (password: `password`)
- **University:** `admin@stanford.edu` (password: `password`)

---

## 2. Project Structure
- `App.jsx`  Core React structure initializing Auth, Theme providers, and defining App Routes.
- `index.css`  Standardized global styles and complex CSS variables configuring the Theme System logic.
- `context/AuthContext.jsx`  Global state context managing active user, roles, and login/logout methods.
- `context/ThemeContext.jsx`  Global state context tracking and toggling between `data-theme="light"` and `data-theme="dark"`.
- `data/mockData.js`  All mocked state structures mimicking intended database functionality.
- `pages/AdminDashboard.jsx`  Router and dynamic layout wrapper configuring the System Admin sidebar view.
- `pages/UniversityDashboard.jsx`  Router and dynamic layout wrapper configuring the University sidebar view.
- `pages/LoginPage.jsx`  Multi-role public authentication page.
- `pages/PublicPage.jsx`  Root public-landing verification hub (includes Hero wrapper and certificate querying).
- `pages/RegisterPage.jsx`  Public-facing University request registration form.
- `components/admin/Dashboard.jsx`  Platform-wide data viz displaying university counts, line charts, and active notifications.
- `components/admin/PendingApplications.jsx`  Datatable interface handling requests allowing approve/reject actions.
- `components/admin/RegisteredUniversities.jsx`  Datatable managing authorized universities allowing suspend/reactivate actions.
- `components/university/Dashboard.jsx`  Institution-specific data viz detailing individual certificate volumes.
- `components/university/IssueCertificate.jsx`  Multi-part interface allowing PDF upload mapping to specific student metadata.
- `components/university/IssuedCertificates.jsx`  Comprehensive datatable displaying all issued certificates with view/revoke tracking.
- `components/university/CertificateDetailsModal.jsx`  Standalone modal parsing granular certificate payload metadata.
- `components/shared/ConfirmModal.jsx`  Reusable, accessible unified interactive confirmation dialogue modal.
- `components/shared/Sidebar.jsx`  Primary app navigation tree adapting nested routing contexts per user role.
- `components/shared/StatusBadge.jsx`  Dynamic standardizing pill-shaped UI components conditionally rendering statuses.
- `components/shared/ThemeToggle.jsx`  Navbar/Sidebar bound theme swapper toggling dark/light context.

---

## 3. Pages

### **1. Public Page**
- **Route Path:** `/`
- **Who can access it:** Public
- **What it does:** Serves as the landing page, handling the core certificate status querying through manual hash input or QR scanner mocks.
- **useState variables:**
  - `hashInput` (string): Stores the requested query ID from the input box.
  - `result` (object|null): Stores the retrieved certificate object payload.
  - `hasSearched` (boolean): Triggers the results rendering UI container when queried.
- **Key Functions:**
  - `handleVerify()`: Executes the look-up matching against mock database.
- **Backend API Requirements:**
  - **Endpoint:** `GET /api/certificates/:hash`
  - **Expected Response:** `{ status, studentName, issuingUniversity, degreeTitle, issueDate, certificateHash }`

### **2. Login Page**
- **Route Path:** `/login`
- **Who can access it:** Public
- **What it does:** Allows universities and admins to authenticate into their respective portals.
- **useState variables:**
  - `email` (string): Unbound email entry.
  - `password` (string): Unbound password entry.
  - `error` (string): Manages invalid login UI prompts.
- **Key Functions:**
  - `handleLogin()`: Triggers Context API dispatch testing credential validity.
- **Backend API Requirements:**
  - **Endpoint:** `POST /api/auth/login`
  - **Request Body:** `{ email, password }`
  - **Expected Response:** `{ token: 'JWT...', user: { name, email, role } }`

### **3. Registration Page**
- **Route Path:** `/register`
- **Who can access it:** Public
- **What it does:** Submits university access requests that push to the admin `Pending Applications` table.
- **useState variables:**
  - `isSubmitting` (bool): Overrides button logic for loading states.
  - `success` (bool): Toggles the success confirmation UI.
  - `formData` (object): Tracks `name`, `country`, `email`, `password`, `confirmPassword`.
- **Key Functions:**
  - `handleChange()`: Dynamically tracks form object state.
  - `handleSubmit()`: Validates password equality and posts.
- **Backend API Requirements:**
  - **Endpoint:** `POST /api/auth/register-university`
  - **Request Body:** `{ name, country, email, password }`
  - **Expected Response:** `201 Created { message: 'Success' }`

### **4. Admin Dashboard Wrapper**
- **Route Path:** `/admin/*`
- **Who can access it:** Admins only (Protected)
- **What it does:** Encapsulates the admin workspace layout generating Sidebar spacing and dynamic Routes binding to nested components.
- **useState variables:**
  - `sidebarOpen` (bool): Tracks hamburger toggle states for mobile layouts.

### **5. University Dashboard Wrapper**
- **Route Path:** `/university/*`
- **Who can access it:** Universities only (Protected)
- **What it does:** Encapsulates the university workspace layout generating Sidebar spacing and dynamic Routes binding to nested components.
- **useState variables:**
  - `sidebarOpen` (bool): Tracks hamburger toggle states for mobile layouts.

---

## 4. Components

### **1. components/admin/Dashboard.jsx**
- **What it does:** Renders platform-wide Recharts visualizations and generic count widgets alongside a recent activity log.
- **Props:** None
- **useState variables:** None
- **Key Functions:**
  - `getActionIcon()`: Dynamically generates lucide icon assets matching string payloads.
- **Backend API Requirements:**
  - **Read:** `GET /api/admin/stats`
  - **Read:** `GET /api/admin/metrics/chart-data`
  - **Read:** `GET /api/admin/activity`

### **2. components/admin/PendingApplications.jsx**
- **What it does:** Populates all requesting universities requiring access evaluation.
- **Props:** None
- **useState variables:**
  - `applications` (array): Active dataset of pending applications.
  - `modalState` (object): Tracks `{ isOpen, type, target }` driving the confirmation prompts.
- **Key Functions:**
  - `handleApprove()`/`handleReject()`: Launches target-bound modal prompts.
  - `confirmAction()`: Executes data mutation post-approval.
- **Backend API Requirements:**
  - **Read:** `GET /api/admin/applications/pending`
  - **Execute:** `POST /api/admin/applications/:id/approve`
  - **Execute:** `POST /api/admin/applications/:id/reject`

### **3. components/admin/RegisteredUniversities.jsx**
- **What it does:** Manages existing active universities modifying suspension flags globally.
- **Props:** None
- **useState variables:**
  - `universities` (array): Active dataset of currently approved applications.
  - `searchQuery` (string): Bound tracking logic for the Searchbar UI filter.
  - `modalState` (object): Tracks `{ isOpen, type, target }` driving the confirmation prompts.
- **Key Functions:**
  - `handleToggleStatus()`: Passes `active` or `suspend` types parsing the specific row target.
  - `confirmAction()`: Mutates and unbinds state resolving modal request.
- **Backend API Requirements:**
  - **Read:** `GET /api/admin/universities`
  - **Execute:** `POST /api/admin/universities/:id/suspend`
  - **Execute:** `POST /api/admin/universities/:id/reactivate`

### **4. components/university/Dashboard.jsx**
- **What it does:** Renders granular University tracking outlining lifetime output and validating issued ratio health.
- **Props:** None
- **useState variables:** None
- **Key Functions:** Implicit data derivations evaluating `validPercentage`.
- **Backend API Requirements:**
  - **Read:** `GET /api/university/stats`
  - **Read:** `GET /api/university/certificates/recent`

### **5. components/university/IssueCertificate.jsx**
- **What it does:** Core creation flow. Takes an expected PDF upload parsing specific student identification factors mapping to generate a secure Certificate on-chain.
- **Props:** None
- **useState variables:**
  - `file` (File|null): Stores active PDF DOM elements.
  - `formData` (object): Tracks `{ studentName, degreeTitle, graduationDate }`.
  - `success` (string|null): Retains the returned output Hash upon successful API callback.
  - `error` (string|null): Error catching block handling UI issues.
- **Key Functions:**
  - `validateFile()`: Enforces > `5MB` rules blocking invalid PDF attempts.
  - `handleSubmit()`: Binds inputs and passes payload generation logic.
- **Backend API Requirements:**
  - **Execute:** `POST /api/university/certificates` (Multipart/form-data)

### **6. components/university/IssuedCertificates.jsx**
- **What it does:** Allows mass-parsing of all lifetime certificates created by target university offering detailed inspect flags or severe Revokations.
- **Props:** None
- **useState variables:**
  - `certificates` (array): Live dataset payload of everything issued locally.
  - `searchHash` (string): Text string query filtering the rendered dataset row limits.
  - `selectedIds` (array): Array grouping logic parsing bulk commands payload targeting.
  - `showBulkConfirm` (bool): Launches independent multi-row Revoke warning dialogues.
  - `revokeModalState`, `detailsModalState` (objects): Tracks individual row actions.
- **Key Functions:**
  - `toggleSelect()`, `toggleSelectAll()`: Injects active selection logic arrays.
  - `handleBulkRevoke()`, `confirmRevoke()`: Formats API arrays mapping global state.
- **Backend API Requirements:**
  - **Read:** `GET /api/university/certificates`
  - **Execute:** `POST /api/university/certificates/:hash/revoke`
  - **Execute:** `POST /api/university/certificates/bulk-revoke`

### **7. components/shared/ConfirmModal.jsx**
- **What it does:** Unifies dialogue prompts rendering explicit warning layers.
- **Props:** `isOpen` (bool), `title` (str), `message` (str), `confirmLabel` (str), `confirmVariant` (str: 'red'|'green'|'orange'), `onConfirm` (fn), `onCancel` (fn).

### **8. components/shared/Sidebar.jsx**
- **What it does:** Determines routing trees formatting to the distinct contextual boundaries of Admins vs Univ.
- **Props:** `role` (str: 'admin'|'university'), `isOpen` (bool), `onClose` (fn).

### **9. components/shared/StatusBadge.jsx**
- **What it does:** Takes string prompts returning heavily stylized UI flags dictating active tracking definitions.
- **Props:** `status` (str: 'valid'|'active'|'revoked'|'invalid'|'suspended').

### **10. components/shared/ThemeToggle.jsx**
- **What it does:** Toggles React Context pushing new HTML payload attributes resetting localized UI themes globally.
- **Props:** `variant` (str: 'default'|'navbar'|'sidebar').

---

## 5. Mock Data
Source file: `src/data/mockData.js`

**1. `mockCertificates`**
Returns dictionary mapped exactly against target `CertificateHash`.
- Status: `string: "valid" | "revoked"`
- StudentName: `string: "John Doe"`
- IssuingUniversity: `string: "Stanford University"`
- DegreeTitle: `string: "Bachelor of Science in Computer Science"`
- IssueDate: `string: "YYYY-MM-DD"`
- CertificateHash: `string: "CERT123456"`

**2. `mockPendingApplications`**
- ID: `integer: 1`
- Name: `string: "Harvard University"`
- Country: `string: "United States"`
- Email: `string: "admin@harvard.edu"`
- Wallet: `string: "0x742d...0bEb"`
- RequestDate: `string: "YYYY-MM-DD"`

**3. `mockRegisteredUniversities`**
- ID: `integer: 1`
- Name: `string: "Stanford University"`
- Country: `string: "United States"`
- Status: `string: "active" | "suspended"`
- RegisteredDate: `string: "YYYY-MM-DD"`
- CertificatesIssued: `integer: 1247`
- Wallet: `string: "0x1a2b...9s0t"`

**4. `mockIssuedCertificates`**
- ID: `integer: 1`
- StudentName: `string: "John Doe"`
- Hash: `string: "CERT123456"`
- IssueDate: `string: "YYYY-MM-DD"`
- Status: `string: "valid" | "revoked"`
- DegreeTitle: `string: "Bachelor of Science in Computer Science"`
- GraduationDate: `string: "YYYY-MM-DD"`

**5. `mockUsers`**
- Role: `string: "admin" | "university"`
- Name: `string: "System Admin"`
- Password: `string: "password"`

---

## 6. Auth Flow
**Login Initialization:**
The `AuthContext.jsx` file houses all token routing. Upon hitting `login()` the frontend tests `<input>` matches and attempts to generate a localized object mapping bounding `user` payload states securely. 

**Backend Requirements:**
The backend must supply a Bearer Token via header routing taking standard JSON payload blocks `{ email, password }` matching the expected logic above. Upon authentication success the system must return `{ token, user: { role, name, email } }` where `role` enforces standard enum gating `admin`, `university`.

**Storage:**
Standard implementations rely on tracking `JWT` mappings housed strictly in `localStorage` securely. All outbound HTTP calls should natively apply `Authorization: Bearer <token>` in the application headers dynamically per session.

**Logout Lifecycle:**
Triggered via `logout()`, removing all context keys destroying payload matching natively booting the router back up the `/login` tree logic.

**Protected Routes:**
Standardized using `<ProtectedRoute>` logic testing for `isLoggedIn` existence and `<RoleRoute allowedRole="">` parsing the returned payloads against explicit active URL directories protecting layouts entirely.

---

## 7. API Integration Guide

| # | Page/Component | Action | Method | Endpoint | Request Body | Expected Response |
|---|----------------|--------|--------|----------|-------------|-------------------|
| 1 | Auth | Login | POST | `/api/auth/login` | `{ email, password }` | `{ token, user: { role, name, email } }` |
| 2 | Auth | Register University | POST | `/api/auth/register-university` | `{ name, country, email, password }` | `201 Created { message }` |
| 3 | PublicPage | Verify Certificate | GET | `/api/certificates/:hash` | None | `{ status, hash, studentName, issuingUniversity, degreeTitle, issueDate }` |
| 4 | Admin Dashboard | Get Global Stats | GET | `/api/admin/stats` | None | `{ validCount, revokedCount, totalUniversities, pendingApplications, suspendedUniversities }` |
| 5 | Admin Dashboard | Get Chart Data | GET | `/api/admin/metrics/chart-data` | None | `{ monthlyData: [...], pieData: [...] }` |
| 6 | Admin Dashboard | Get Recent Activity | GET | `/api/admin/activity` | None | `Activity[] { id, action, target, date, type }` |
| 7 | Admin Pending | Get Pending Apps | GET | `/api/admin/applications/pending` | None | `Application[] { id, name, country, email, wallet, requestDate }` |
| 8 | Admin Pending | Approve Application | POST | `/api/admin/applications/:id/approve` | None | `200 OK { message }` |
| 9 | Admin Pending | Reject Application | POST | `/api/admin/applications/:id/reject` | None | `200 OK { message }` |
| 10| Admin Unix | Get Universities | GET | `/api/admin/universities` | None | `University[] { id, name, country, status, registeredDate, certificatesIssued, wallet }` |
| 11| Admin Unix | Suspend University| POST | `/api/admin/universities/:id/suspend` | None | `200 OK { message }` |
| 12| Admin Unix | Reactivate Univ. | POST | `/api/admin/universities/:id/reactivate`| None | `200 OK { message }` |
| 13| Univ Dashboard | Get Local Stats | GET | `/api/university/stats` | None | `{ total, valid, revoked, thisMonth }` |
| 14| Univ Issue | Issue Certificate | POST | `/api/university/certificates` | `multipart/form-data (file, studentName, degreeTitle, graduationDate)` | `201 Created { hash }` |
| 15| Univ Issued | Get Issued Certs | GET | `/api/university/certificates` | None | `Certificate[] { id, studentName, hash, issueDate, status, degreeTitle, graduationDate }` |
| 16| Univ Issued | Revoke Certificate| POST | `/api/university/certificates/:hash/revoke`| None | `200 OK { message }` |
| 17| Univ Issued | Bulk Revoke Certs | POST | `/api/university/certificates/bulk-revoke` | `{ hashes: ["CERT123...", ...] }` | `200 OK { message }` |

---

## 8. Theme System
The frontend has a fully implemented dark mode logic system configured identically testing attribute variables natively mapping local data context layers defining all primary rendering scopes automatically.

**Light Mode Defaults (`data-theme="light"`):**
- `--primary`: `#2A52A0`
- `--bg-app`: `#EEF2FF`
- `--bg-card`: `#FFFFFF`
- `--text-primary`: `#0D1B3E`
- `--border`: `#C8D0E8`

**Dark Mode Defaults (`data-theme="dark"`):**
- `--primary`: `#3B82F6`
- `--bg-app`: `#0A1628`
- `--bg-card`: `#0F2044`
- `--text-primary`: `#E8EEFF`
- `--border`: `#1A2A4A`

---

## 9. Known Issues & Notes
- **File Parsing Integration:** The `IssueCertificate` implementation securely tests local `<input>` payloads validating physical payload limitations prior to API calls rejecting strings >5MB. The backend will map IPFS endpoints resolving explicit DOM states post-transaction creating explicit decentralized mapping targets physically routing hashes dynamically.
- **Frontend Authentication Status:** Context logic presently intercepts raw HTTP handling locally testing hardcoded credentials matching index payloads generating standard responses instantly avoiding network callbacks entirely. Re-hooking network logic removes basic dictionary mapping overriding token mapping locally securely mapping global outputs natively wrapping user instances contextually.
