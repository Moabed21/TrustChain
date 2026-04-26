# TrustChain System Architecture Documentation

## 1. System Overview
TrustChain is a full-stack web application designed for secure issuance, management, and verification of digital certificates. 
The system provides a robust platform for educational institutions to issue certificates, administrators to manage universities, and the public to verify the authenticity of issued certificates. It relies on a role-based access control (RBAC) model to differentiate between administrative staff and university personnel.

## 2. Architecture Explanation
The application follows a standard decoupled client-server architecture:
- **Backend**: Built with FastAPI (Python), serving as a RESTful API provider. It handles all business logic, data persistence, and security validations.
- **Frontend**: Built with React, functioning as a single-page application (SPA). It consumes the FastAPI endpoints to render dynamic interfaces.

### Request/Response Flow
1. **Client Action**: The user interacts with the React frontend (e.g., clicking a button, submitting a form).
2. **API Request**: The React application constructs an HTTP request (GET, POST, etc.) and sends it to the FastAPI backend. Authentication tokens are attached to the headers if the route is protected.
3. **Backend Processing**: FastAPI receives the request, validates the payload and authentication status, interacts with the data layer, and processes the business logic.
4. **API Response**: The backend returns a JSON response containing the requested data or an operation status, along with an appropriate HTTP status code.
5. **UI Update**: The frontend receives the response, updates its internal state, and re-renders the user interface to reflect the new data or status.

## 3. Authentication Flow
The system implements a stateless authentication mechanism using JSON Web Tokens (JWT).

### Login Process
- The user submits their email and password through the frontend login form.
- The React application sends a `POST` request to `/api/auth/login`. Crucially, this request uses `multipart/form-data` (FormData) instead of `application/json`, adhering to the OAuth2 specification for password bearer flows.
- The FastAPI backend validates the credentials against the database.
- If valid, the backend also checks the user's account status (e.g., rejecting login if the status is "Pending" or "Suspended").
- Upon successful validation, the backend generates and returns a JWT along with the user's role and email.

### Token Management & Role-Based Access
- **Storage**: The frontend stores the received JWT securely (typically in `localStorage` or `sessionStorage` for SPA architectures).
- **Usage**: For subsequent requests to protected endpoints, the React frontend attaches this token in the HTTP `Authorization` header as a `Bearer` token (`Authorization: Bearer <token>`).
- **Roles**: The system supports distinct roles, primarily `admin` and `university`. The frontend uses the role returned during login to determine which dashboard to render. The backend inspects the JWT on protected routes to enforce authorization, ensuring that a `university` user cannot access `admin` endpoints and vice versa.

## 4. API Endpoints Documentation

### Auth Router
- **Endpoint**: `POST /api/auth/login`
- **Purpose**: Authenticates a user and issues a JWT.
- **Request Type**: `multipart/form-data` (FormData). Requires `username` (email) and `password` fields.
- **Response Structure**: JSON containing the `access_token` (JWT), `token_type` ("bearer"), user `role`, and `email`.

### Universities Router
- **Endpoint**: `GET /api/universities`
- **Purpose**: Retrieves a list of registered universities.
- **Request Type**: None (GET request). Requires Bearer token (Admin role).
- **Response Structure**: JSON array of university objects containing details like name, country, status, and registration date.

### Certificates Router
- **Endpoint**: `POST /api/certificates`
- **Purpose**: Issues a new certificate.
- **Request Type**: JSON payload containing certificate details (student name, issue date, etc.). Requires Bearer token (University role).
- **Response Structure**: JSON object representing the newly created certificate, including its generated hash and status.

### Verify Router
- **Endpoint**: `POST /api/verify`
- **Purpose**: Verifies the authenticity and status of a specific certificate using its hash or ID.
- **Request Type**: JSON payload containing the certificate hash/identifier. (Public endpoint, no token required).
- **Response Structure**: JSON object detailing the certificate's validity status (e.g., Valid, Revoked, Not Found).

## 5. Frontend Integration Explanation

### Connecting to the Backend
The React frontend communicates with the FastAPI backend using standard HTTP clients (such as `fetch` or `axios`). The base URL of the FastAPI server is configured in the frontend's environment variables.

### Structuring API Calls
API calls are typically encapsulated within dedicated service functions or custom hooks to keep components clean. 
- **Public Calls**: Sent without authorization headers (e.g., verifying a certificate).
- **Protected Calls**: The HTTP client automatically retrieves the stored JWT and appends it to the `Authorization: Bearer <token>` header before dispatching the request.

### Protected Routes
In React, protected routes are implemented conceptually using wrapper components (e.g., a `ProtectedRoute` or `AuthGuard` component). 
- These wrappers intercept navigation attempts.
- They check for the presence of a valid JWT and the correct user role.
- If unauthorized, the user is redirected to the login page or a generic "Access Denied" page.

## 6. Security Notes

- **FormData for Login**: The `/api/auth/login` endpoint expects `multipart/form-data` rather than `application/json`. This design aligns perfectly with the standard OAuth2 Password Flow specification, which FastAPI's built-in `OAuth2PasswordRequestForm` relies on.
- **Bearer Token Requirement**: Utilizing a Bearer token ensures that the backend remains stateless. The backend does not need to manage sessions; it cryptographically verifies the JWT on each request to confirm the user's identity and permissions.
- **Status Codes**: 
  - `401 Unauthorized`: Indicates that authentication failed. This occurs if the user provides incorrect credentials during login, or if they attempt to access a protected route without a token or with an expired/invalid token.
  - `403 Forbidden`: Indicates an authorization failure. The user is authenticated (has a valid token) but does not have the correct role/permissions to access the specific resource (e.g., a university attempting to access an admin-only endpoint).
