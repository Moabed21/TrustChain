# TrustChain Walkthrough

I have successfully built the **TrustChain Blockchain-based Academic Certificate System** as a complete standalone React application, ready to be reviewed and tested locally.

## What was Accomplished

### 1. Initialization and Layout setup
- Hand-crafted a Vite configuration alongside [package.json](file:///c:/Users/ahmad/Desktop/anti/package.json) setup to build a React application since the necessary package manager was not available.
- Developed a comprehensive CSS design system ([index.css](file:///c:/Users/ahmad/Desktop/anti/src/index.css)) incorporating the requested variables, DM Sans / JetBrains Mono fonts, spacing utilities, button states, and color-coded status badges for the entire application.

### 2. Mock Data and Global Configurations
- Created [mockData.js](file:///c:/Users/ahmad/Desktop/anti/src/data/mockData.js) covering all essential models: Mock Certificates, Pending Applications, Universities, Issued Certificates, and Users.
- Set up an [AuthContext.jsx](file:///c:/Users/ahmad/Desktop/anti/src/context/AuthContext.jsx) wrapper that tracks current user state (`user`, `role`, and `isLoggedIn`) and exposes [login](file:///c:/Users/ahmad/Desktop/anti/src/context/AuthContext.jsx#16-25) and [logout](file:///c:/Users/ahmad/Desktop/anti/src/context/AuthContext.jsx#9-10) actions.

### 3. Application Pages and Flow
- **[PublicPage.jsx](file:///c:/Users/ahmad/Desktop/anti/src/pages/PublicPage.jsx)**: Developed the root page interface containing a visual QR scanner widget and a manual Verification interface. It successfully validates test certificates like `CERT123456` and renders corresponding valid/revoked elements from the mock store.
- **[LoginPage.jsx](file:///c:/Users/ahmad/Desktop/anti/src/pages/LoginPage.jsx)**: Designed an authentication page utilizing the mocked users module. Automatically routes authenticated users to either the Admin view (`/admin/pending`) or the University view (`/university/issue`) based on role.
- **[RegisterPage.jsx](file:///c:/Users/ahmad/Desktop/anti/src/pages/RegisterPage.jsx)**: Contains an information banner component mapping all required registration form fields.
- **Admin Dashboard Layout**: A nested layout containing [PendingApplications](file:///c:/Users/ahmad/Desktop/anti/src/components/admin/PendingApplications.jsx#6-100) and [RegisteredUniversities](file:///c:/Users/ahmad/Desktop/anti/src/components/admin/RegisteredUniversities.jsx#7-94) components, providing grid tables with fully functional "Approve", "Reject", "Suspend", and "Reactivate" modal overlays triggering mocked state updates locally.
- **University Dashboard Layout**: Includes [IssueCertificate](file:///c:/Users/ahmad/Desktop/anti/src/components/university/IssueCertificate.jsx#4-131) and [IssuedCertificates](file:///c:/Users/ahmad/Desktop/anti/src/components/university/IssuedCertificates.jsx#8-97). Enables issuing form logic (simulated file dragging/dropping) that generates a random `CERT...` hash string as a success response, and contains grids summarizing certificates tied to a university user account with view/revoke modals.

### 4. Final Routing ([App.jsx](file:///c:/Users/ahmad/Desktop/anti/src/App.jsx))
Applied `react-router-dom` to centralize declarative routing paths and added robust access-control mechanisms via [ProtectedRoute](file:///c:/Users/ahmad/Desktop/anti/src/App.jsx#12-18) (Requires authentication) and [RoleRoute](file:///c:/Users/ahmad/Desktop/anti/src/App.jsx#19-24) (Ensures the connected user aligns with Admin / University boundaries).

## How to View the Application Locally

Since I initialized standard Vite files from scratch, follow these instructions to test the app interactively in your environment:

1. Open your terminal pointing to `c:/Users/ahmad/Desktop/anti`.
2. Run `npm install` to download dependencies cleanly from [package.json](file:///c:/Users/ahmad/Desktop/anti/package.json).
3. Run `npm run dev` to start the localhost Vite server.
4. Open the localhost URL in your browser. Feel free to use credentials provided in the bottom-corner tip of the Login portal.

## 5. University Dashboard Addition

Added the `Dashboard` component to provide an overview specifically for the university portal.

### Technical Implementation
- **Dashboard Component**: 
  - Created `Dashboard.jsx`.
  - Implemented dynamic calculation for "Total", "Valid", "Revoked", and "Issued This Month" statistics querying from `mockIssuedCertificates`.
  - Extracted the 5 most recent certificates and displayed them in the latest certificates table seamlessly using `StatusBadge` formatting.
  
- **Routing & Navigation Updates**:
  - Updated `UniversityDashboard.jsx` to route `/university/dashboard`.
  - Modified the sidebar in `Sidebar.jsx` to show the 'Dashboard' as the primary first navigation item for universities.
  - Set the login redirect target from `/university/issue` to `/university/dashboard` inside `LoginPage.jsx`.

- **CSS Tweaks**:
  - Appended all the provided styles correctly to `index.css` for grid layouts, unified spacing, and quick action styling.
