/**
 * Endpoint groups:
 *   AUTH          3 – login, me, logout
 *   UNIVERSITIES  9 – register, applications, approve/reject, suspend/reactivate, wallet, list
 *   CERTIFICATES  6 – issue, confirm, list, get, revoke, revoke/confirm
 *   VERIFY        3 – by file, by QR
 */
import axios from 'axios';

//axios instance to connect with the backend
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000, // 30s  some endpoints (IPFS upload, blockchain) are slow
});
//add token to every request
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// handle the response 401 error
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData(); 
      //remove the bad token
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register') &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

//token utils
export function storeAuthToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('trustchain_user');
  localStorage.removeItem('trustchain_role');
}
//auth api
// post login endpoint
export async function loginAPI(email, password) {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  const { data } = await API.post('/api/auth/login', params);
  return data;
}
//get me endpoint
export async function getMeAPI() {
  const { data } = await API.get('/api/auth/me');
  return data;
}

//post logout endpoint
export async function logoutAPI() {
  try {
    await API.post('/api/auth/logout');
  } finally {
    clearAuthData();
  }
}

//universities api
//post register university endpoint
export async function registerUniversityAPI(payload) {
  const { data } = await API.post('/api/universities/register', {
    university_name: payload.university_name,
    country: payload.country,
    email: payload.email,
    password: payload.password,
  });
  return data;
}
// get pending applications endpoint
export async function getPendingApplicationsAPI() {
  const { data } = await API.get('/api/universities/applications');
  return data;
}

//post approve application endpoint
export async function approveApplicationAPI(id) {
  const { data } = await API.put(`/api/universities/applications/${id}/approve`);
  return data;
}

//post reject application endpoint
export async function rejectApplicationAPI(id) {
  const { data } = await API.put(`/api/universities/applications/${id}/reject`);
  return data;
}

//get all universities endpoint
export async function getAllUniversitiesAPI(page = 1, limit = 100) {
  const { data } = await API.get('/api/universities/all_universities', {
    params: { page, limit },
  });
  return data;
}

//get single university endpoint
export async function getUniversityAPI(id) {
  const { data } = await API.get(`/api/universities/${id}`);
  return data;
}

//post suspend university endpoint

export async function suspendUniversityAPI(id) {
  const { data } = await API.put(`/api/universities/${id}/suspend`);
  return data;
}

//post reactivate university endpoint
export async function reactivateUniversityAPI(id) {
  const { data } = await API.put(`/api/universities/${id}/reactivate`);
  return data;
}

//post register wallet endpoint
export async function registerWalletAPI(walletAddress) {
  const { data } = await API.put('/api/universities/me/wallet', {
    wallet_address: walletAddress,
  });
  return data;
}


//  GET /api/universities/stats
//  Admin-only — aggregate stats for dashboard charts.

export async function getAdminStatsAPI() {
  const { data } = await API.get('/api/universities/stats');
  return data;
}

//certificates api
//post create certificate endpoint
export async function createCertificateAPI({ student_name, major, graduation_date, pdf }) {
  const formData = new FormData();
  formData.append('student_name', student_name);
  formData.append('major', major);
  formData.append('graduation_date', graduation_date);
  formData.append('pdf', pdf);

  const { data } = await API.post('/api/certificates/issue', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // IPFS upload can be slow
  });
  return data;
}

// POST /api/certificates/:id/confirm
// University-only  step 2 of issuance.
// Sends the MetaMask tx_hash to backend for on-chain verification.
export async function confirmCertificateAPI(certificateId, txHash) {
  const { data } = await API.post(`/api/certificates/${certificateId}/confirm`, {
    tx_hash: txHash,
  });
  return data;
}

// GET /api/certificates
// University-only  list all certificates issued by this university.
export async function listCertificatesAPI() {
  const { data } = await API.get('/api/certificates');
  return data;
}

// GET /api/certificates/:id
// University-only  single certificate details.
export async function getCertificateAPI(certificateId) {
  const { data } = await API.get(`/api/certificates/${certificateId}`);
  return data;
}

// PUT /api/certificates/:id/revoke
// University-only  step 1 of revocation.
// Marks cert as PendingRevocation, returns hash for MetaMask signing.
export async function revokeCertificateAPI(certificateId) {
  const { data } = await API.put(`/api/certificates/${certificateId}/revoke`);
  return data;
}

// POST /api/certificates/:id/revoke/confirm
// University-only  step 2 of revocation.
export async function confirmRevocationAPI(certificateId, txHash) {
  const { data } = await API.post(`/api/certificates/${certificateId}/revoke/confirm`, {
    tx_hash: txHash,
  });
  return data;
}


// GET /api/certificates/:id/download
// University-only — downloads the original PDF from IPFS (decrypted).
export async function downloadCertificateAPI(certificateId) {
  const { data } = await API.get(`/api/certificates/${certificateId}/download`, {
    responseType: 'blob',
  });
  return data;
}

//verify api 

// POST /api/verify/file
// Public  verify a certificate by uploading its PDF.
export async function verifyByFileAPI(pdfFile) {
  const formData = new FormData();
  formData.append('pdf', pdfFile);

  const { data } = await API.post('/api/verify/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// POST /api/verify/qr
// Public  verify a certificate by uploading a QR code image.
export async function verifyByQrAPI(qrImageFile) {
  const formData = new FormData();
  formData.append('qr_image', qrImageFile);

  const { data } = await API.post('/api/verify/qr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

//activity api 
// GET /api/activities
// Admin-only — paginated activity log, newest first.

export async function getActivitiesAPI(page = 1, limit = 50) {
  const { data } = await API.get('/api/activities', { params: { page, limit } });
  return data;
}

// ─── Export the raw axios instance for edge cases ────────────────
export default API;
