# TrustChain Frontend — S 10 Wallet Implementation Guide

## For the Frontend Team

## Backend contact: Alqasam & Moabed

## What You Need to Implement

## The backend manages login auth (JWT) as before. Your job is to add local wallet management

## on top of the existing login flow. The private key never leaves the browser. The backend never

## sees it.

## Step 1 — Install ethers.js

## Step 2 — Understand the Wallet Lifecycle

```
bash
```
```
cd frontend
npm install ethers
```
```
FIRST LOGIN (no keystore in localStorage yet)
─────────────────────────────────────────────
```
1. POST /api/auth/login → get JWT (existing flow, unchanged)
2. ethers.Wallet.createRandom() → generate new random wallet
3. wallet.encrypt(password) → keystore JSON (encrypted, safe to store)
4. localStorage.setItem('trustchain_keystore', keystoreJSON)
5. PUT /api/universities/me/wallet { wallet_address: wallet.address }
    → tells backend the wallet address (one time only)
6. wallet stays in memory → used for signing

```
EVERY SUBSEQUENT LOGIN (keystore exists in localStorage)
────────────────────────────────────────────────────────
```
1. POST /api/auth/login → get JWT (existing flow, unchanged)
2. localStorage.getItem('trustchain_keystore') → found
3. ethers.Wallet.fromEncryptedJson(keystoreJSON, password) → unlock wallet
4. wallet stays in memory → used for signing


## Step 3 — Update AuthContext.jsx

```
PASSWORD CHANGE (if you add this feature later)
────────────────────────────────────────────────
```
1. ethers.Wallet.fromEncryptedJson(oldKeystoreJSON, oldPassword) → get wallet
2. wallet.encrypt(newPassword) → new keystore JSON
3. localStorage.setItem('trustchain_keystore', newKeystoreJSON)
4. wallet address unchanged ✅ no backend call needed

```
ISSUE CERTIFICATE
──────────────────
```
1. wallet from memory → connect to TrustChain contract
2. contract.issueCertificate(certHash, encCID) → signed locally
3. tx submitted from university wallet → msg.sender = university ✅

```
LOST KEYSTORE (cleared browser cache without backup)
─────────────────────────────────────────────────────
→ University must contact admin
→ Admin calls registerUniversity(newWalletAddress) on-chain
→ University re-registers wallet via first-login flow
→ Old certificates still show old wallet address as issuer (permanent)
```
```
jsx
```

import { ethers } from 'ethers';

// ─── Constants ───────────────────────────────────────────────
const KEYSTORE_KEY = 'trustchain_keystore';
// Key name in localStorage where the encrypted wallet is stored.
// Keep this consistent — if you change it, existing users lose their wallet.

const API_BASE = 'http://localhost:8000/api';
// Change to your production URL when deploying.

// ─── AuthContext ──────────────────────────────────────────────
const AuthContext = createContext({
user: null,
role: null,
token: null,
wallet: null, // ← NEW: ethers.Wallet instance, in memory only
isLoggedIn: false,
login: async () => {},
logout: () => {},
});

export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [role, setRole] = useState(null);
const [token, setToken] = useState(null);
const [wallet, setWallet] = useState(null); // ← NEW

const login = async (email, password) => {
// ── Step 1: Authenticate with backend ──────────────────────
const formData = new URLSearchParams();
formData.append('username', email);
formData.append('password', password);
// OAuth 2 PasswordRequestForm expects form data, not JSON.
// username field = email (that's how your backend reads it).

```
const authRes = await fetch(`${API_BASE}/auth/login`, {
method: 'POST',
body: formData,
});
```
```
if (!authRes.ok) {
const err = await authRes.json();
throw new Error(err.detail || 'Login failed');
```

```
// Throw so LoginPage can catch and show the error message.
}
```
```
const authData = await authRes.json();
const jwt = authData.access_token;
const userRole = authData.role;
// Backend returns: { access_token, token_type, role, email }
```
```
// ── Step 2: Handle wallet ──────────────────────────────────
// Only universities need wallets. Admin uses no wallet.
let derivedWallet = null;
```
```
if (userRole === 'university') {
const existingKeystore = localStorage.getItem(KEYSTORE_KEY);
```
if (!existingKeystore) {
// ── FIRST LOGIN: generate new wallet ──────────────────
derivedWallet = ethers.Wallet.createRandom();
// createRandom() generates a cryptographically secure random private key.
// This is better than deriving from password — no brute force risk.

```
const keystoreJson = await derivedWallet.encrypt(password);
// encrypt() takes the password and returns a Keystore JSON string.
// The private key is AES-256 encrypted inside this JSON.
// Safe to store in localStorage — without the password, it's useless.
```
```
localStorage.setItem(KEYSTORE_KEY, keystoreJson);
// Store encrypted keystore in browser. Survives page refresh.
// Does NOT survive cache clear — university should download backup.
```
```
// Tell backend the wallet address (one time only)
await fetch(`${API_BASE}/universities/me/wallet`, {
method: 'PUT',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${jwt}`,
},
body: JSON.stringify({ wallet_address: derivedWallet.address }),
});
// Backend saves wallet_address to DB and sends MATIC to fund the wallet.
// After this call, the university can submit blockchain transactions.
```
```
} else {
// ── SUBSEQUENT LOGINS: decrypt existing keystore ──────
```

derivedWallet = await ethers.Wallet.fromEncryptedJson(
existingKeystore,
password
);
// fromEncryptedJson() decrypts the keystore using the password.
// If password is wrong, this throws — catch it in LoginPage.
// Same password → same wallet → same address ✅
}

// Connect wallet to Polygon Amoy so it can submit transactions
const provider = new ethers.JsonRpcProvider(
'https://rpc-amoy.polygon.technology'
);
derivedWallet = derivedWallet.connect(provider);
// Without connecting to a provider, the wallet can sign messages
// but cannot submit transactions to the network.
}

```
// ── Step 3: Save everything to state ──────────────────────
setToken(jwt);
setRole(userRole);
setUser({ email: authData.email, role: userRole });
setWallet(derivedWallet);
// wallet is null for admin, ethers.Wallet instance for universities.
```
```
return userRole;
// Return role so LoginPage knows where to navigate.
};
```
```
const logout = () => {
setUser(null);
setRole(null);
setToken(null);
setWallet(null);
// Do NOT clear localStorage here — keystore should survive logout.
// University needs it for next login.
};
```
return (
<AuthContext.Provider value={{
user, role, token, wallet, isLoggedIn: !!user,
login, logout
}}>
{children}


## Step 4 — Update LoginPage.jsx

### Replace the handleLogin function:

### Add a loading state so the button shows feedback during wallet decryption

### (it takes 1 - 3 seconds — ethers intentionally makes decrypt slow to resist brute force):

```
</AuthContext.Provider>
);
};
```
```
export const useAuth = () => useContext(AuthContext);
```
```
jsx
```
```
const handleLogin = async (e) => {
e.preventDefault();
setError('');
setLoading(true);
```
```
try {
const role = await login(email, password);
// login() in AuthContext handles everything:
// API auth, wallet derivation/decryption, state update.
```
```
if (role === 'admin') {
navigate('/admin/dashboard');
} else {
navigate('/university/dashboard');
}
} catch (err) {
setError(err.message || 'Login failed');
// Shows backend error (wrong password, suspended, etc.)
// or keystore decryption error (wrong password for wallet).
} finally {
setLoading(false);
}
};
```
```
jsx
```

## Step 5 — Update RegisterPage.jsx

### No wallet changes needed at registration. The wallet is created on first login, not at registration.

### Registration just sends university info to the backend as before.

### Only change: make the form actually call the real API instead of the mock:

```
const [loading, setLoading] = useState(false);
```
```
// On the submit button:
<button type="submit" disabled={loading}>
{loading? 'Unlocking wallet...' : 'Login'}
</button>
```
```
jsx
```

## Step 6 — Issue Certificate (IssueCertificate.jsx)

### This is where the wallet actually signs a blockchain transaction.

### The backend handles IPFS + hashing + DB. The frontend handles the blockchain tx.

```
const handleSubmit = async (e) => {
e.preventDefault();
if (formData.password !== formData.confirmPassword) {
alert("Passwords don't match");
return;
}
```
```
setIsSubmitting(true);
try {
const res = await fetch('http://localhost:8000/api/universities/register', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
university_name: formData.name,
country: formData.country,
email: formData.email,
password: formData.password,
}),
});
```
```
if (!res.ok) {
const err = await res.json();
throw new Error(err.detail || 'Registration failed');
}
```
```
setSuccess(true);
setTimeout(() => navigate('/login'), 2000 );
} catch (err) {
alert(err.message);
} finally {
setIsSubmitting(false);
}
};
```
```
jsx
```

import { ethers } from 'ethers';
import { useAuth } from '../../context/AuthContext';

// TrustChain ABI — only the functions you call from frontend
// Get the full ABI from the backend team after contract deployment
const TRUSTCHAIN_ABI = [
"function issueCertificate(string calldata certificateHash, string calldata encryp
"function revokeCertificate(string calldata certificateHash) external",
];

const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
// Replace with actual address after Remix deployment.
// Backend team will provide this.

const IssueCertificate = () => {
const { wallet, token } = useAuth();

```
const handleIssueCertificate = async (formData) => {
// ── Step 1: Send data to backend for processing ────────────
// Backend hashes the cert data, encrypts PDF, uploads to IPFS,
// and returns the certHash + encryptedCid for the blockchain call.
const backendRes = await fetch('http://localhost:8000/api/certificates/prepare',
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${token}`,
},
body: JSON.stringify(formData),
});
// NOTE: Ask backend team for the exact endpoint and request/response shape.
```
```
const { certificate_hash, encrypted_cid } = await backendRes.json();
```
// ── Step 2: Sign and submit blockchain transaction ─────────
const contract = new ethers.Contract(
CONTRACT_ADDRESS,
TRUSTCHAIN_ABI,
wallet
// wallet from AuthContext — already connected to Amoy provider.
// Transactions signed with university's private key automatically.
);

```
const tx = await contract.issueCertificate(certificate_hash, encrypted_cid);
```

## Step 7 — Optional: Keystore Backup Button

### Add this to the university dashboard so they can download their keystore file.

### If they clear their browser, this backup is the only recovery option.

```
// This sends the transaction to Polygon Amoy.
// msg.sender in the contract = university wallet address ✅
```
```
await tx.wait();
// Wait for the transaction to be mined (1 block confirmation).
// tx.hash is the transaction hash — useful for showing a success link.
```
```
// ── Step 3: Confirm to backend that tx was mined ───────────
await fetch('http://localhost:8000/api/certificates/confirm', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${token}`,
},
body: JSON.stringify({
certificate_hash,
tx_hash: tx.hash,
}),
});
// Backend saves the certificate to MongoDB with the tx hash.
// NOTE: Confirm exact endpoint with backend team.
};
};
```
```
jsx
```

## API Endpoints Summary (What Backend Provides)

```
Method Endpoint Auth Purpose
```
#### POST /api/auth/login None Login,^ get^ JWT

#### GET /api/auth/me JWT Get current user info

#### POST /api/auth/logout JWT Logout

#### POST /api/universities/register None Submit^ registration

#### PUT /api/universities/me/wallet JWT Save^ wallet^ address^ (first^ login^ only)

#### POST /api/certificates JWT Issue^ certificate

```
import { useAuth } from '../../context/AuthContext';
```
```
const KeystoreBackup = () => {
const handleDownload = () => {
const keystore = localStorage.getItem('trustchain_keystore');
if (!keystore) return;
```
```
const blob = new Blob([keystore], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'trustchain-wallet-backup.json';
a.click();
URL.revokeObjectURL(url);
// Creates a download of the encrypted keystore JSON.
// Safe to download — it's encrypted with their password.
// Without the password, the file is useless to an attacker.
};
```
```
return (
<button onClick={handleDownload}>
Download Wallet Backup
</button>
);
};
```

```
Method Endpoint Auth Purpose
```
#### GET /api/certificates JWT List^ university^ certificates

#### GET /api/certificates/{id} JWT Certificate^ details

#### PUT /api/certificates/{id}/revoke JWT Revoke certificate

#### GET /api/certificates/{id}/download JWT Download^ PDF

#### POST /api/verify None Verify by hash

#### POST /api/verify/qr None Verify^ by^ QR^ scan

## Things to Ask the Backend Team

### Contract address after Remix deployment

### Full TrustChain ABI JSON file

### Exact request/response shape for /api/certificates (issue flow)

### Polygon Amoy RPC URL confirmation

### CORS configuration — make sure localhost:5173 is allowed

## Important Notes

### The wallet private key never leaves the browser — don't send it anywhere

### wallet.encrypt() is intentionally slow ( 1 - 3 seconds) — show a loading spinner

### The keystore in localStorage survives page refresh but not cache clear

### Always show the "Download Wallet Backup" button prominently on the dashboard

### Test on Polygon Amoy testnet — get test MATIC from https://faucet.polygon.technology

### TrustChain Frontend Guide — S 10 Local Keystore ImplementationPrepared by: Backend Team

### (Alqasam & Moabed) | April 2026


