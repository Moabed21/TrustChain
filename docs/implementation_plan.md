# TrustChain - Blockchain-based Academic Certificate System

Build "TrustChain", a React web application for Blockchain-based Academic Certificate Verification using Vite and mock data.

## Proposed Changes

### Project Structure
- Initialize a React application using Vite in `c:/Users/ahmad/Desktop/anti`.
- Install dependencies: `react-router-dom`, `lucide-react`.

### Configuration & Styles
#### [MODIFY] src/index.css
- Add complete design system: DM Sans & JetBrains Mono fonts, CSS variables (primary, bg, text, status colors), and base styling.

#### [MODIFY] src/App.jsx
- Configure `react-router-dom` v6 with required routes.
- Create generic layout and routing wrappers (`ProtectedRoute` and `RoleRoute`).

### Core Data & Context
#### [NEW] src/data/mockData.js
- Define mock data: `mockCertificates`, `mockPendingApplications`, `mockRegisteredUniversities`, `mockIssuedCertificates`, and `mockUsers`.

#### [NEW] src/context/AuthContext.jsx
- Implement authentication context managing `user`, `role`, `isLoggedIn`, `login`, and `logout`.

### Shared UI Components
#### [NEW] src/components/shared/StatusBadge.jsx
- Badge component applying design system status colors.

#### [NEW] src/components/shared/ConfirmModal.jsx
- Reusable confirmation modal with dark overlay and customizable actions.

### Pages: Authentication & Public
#### [NEW] src/pages/PublicPage.jsx
- Verification page with QR code (UI only) and manual hash input displaying validation status.
#### [NEW] src/pages/LoginPage.jsx
- Login form authenticating via `mockUsers` and redirecting based on role.
#### [NEW] src/pages/RegisterPage.jsx
- Registration request form (UI only) redirecting back to login.

### Pages: Admin Portal
#### [NEW] src/pages/AdminDashboard.jsx
- Admin layout with Sidebar navigation.
#### [NEW] src/components/admin/PendingApplications.jsx
- Table of pending applications with approve/reject actions.
#### [NEW] src/components/admin/RegisteredUniversities.jsx
- Table of registered universities with suspend/reactivate actions.

### Pages: University Portal
#### [NEW] src/pages/UniversityDashboard.jsx
- University layout with Sidebar navigation.
#### [NEW] src/components/university/IssueCertificate.jsx
- Form to upload PDF and issue a certificate, generating a hash.
#### [NEW] src/components/university/IssuedCertificates.jsx
- Table displaying issued certificates with view/revoke options.
#### [NEW] src/components/university/CertificateDetailsModal.jsx
- Modal showing complete certificate information.

## Verification Plan
### Automated Verification
Will check that Vite dev server runs correctly after initialization.
Will use the `run_command` tool to run `npm run build` after completion to ensure there are no compilation errors.

### Manual Verification
1. Open the application in the browser at the local dev URL.
2. **Public Page:** Verify the UI matches specifications and search for `CERT123456` and `CERT789012` to see status cards.
3. **Login:** Login with admin (`admin@trustchain.com` / `password`) -> redirects to Admin portal.
4. **Admin Dashboard:** Approve/Reject requests, Suspend universities.
5. **Login:** Login with university (`admin@stanford.edu` / `password`) -> redirects to University portal.
6. **University Dashboard:** Submit a new certificate and view/revoke it in the Issued Certificates table.
