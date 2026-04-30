const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// ── TOKEN HELPERS ─────────────────────
export const saveToken = (token) =>
  localStorage.setItem('token', token);

export const getToken = () =>
  localStorage.getItem('token');

export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('email');
};

// ── AUTH ──────────────────────────────

// 1. POST /api/auth/login
// Type: Form Data (NOT JSON)
// username field = email
export const loginAPI = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
  // Returns: { access_token, token_type, role, email }
};

// 2. GET /api/auth/me
export const getMeAPI = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Session expired');
  return data;
  // Returns: { id, email, role, status, wallet_address }
};

// 3. POST /api/auth/logout
export const logoutAPI = async () => {
  await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  removeToken();
};

// ── UNIVERSITIES ──────────────────────

// 4. POST /api/universities/register
export const registerUniversityAPI = async (data) => {
  const res = await fetch(`${BASE_URL}/api/universities/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      university_name: data.name,
      country: data.country,
      official_email: data.email,
      password: data.password
    })
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.detail || 'Registration failed');
  return result;
  // Returns: { message }
};

// 5. GET /api/universities/applications
export const getPendingApplicationsAPI = async () => {
  const res = await fetch(
    `${BASE_URL}/api/universities/applications`,
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch');
  return data;
  // Returns: Array of { _id, university_name, country,
  //   official_email, status, register_date, wallet_address }
};

// 6. PUT /api/universities/applications/:id/approve
export const approveApplicationAPI = async (id) => {
  const res = await fetch(
    `${BASE_URL}/api/universities/applications/${id}/approve`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` }
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to approve');
  return data;
  // Returns: { message }
};

// 7. PUT /api/universities/applications/:id/reject
export const rejectApplicationAPI = async (id) => {
  const res = await fetch(
    `${BASE_URL}/api/universities/applications/${id}/reject`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` }
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to reject');
  return data;
  // Returns: { message }
};

// 8. GET /api/universities/:id
export const getUniversityAPI = async (id) => {
  const res = await fetch(
    `${BASE_URL}/api/universities/${id}`,
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Not found');
  return data;
  // Returns: { _id, university_name, country, official_email,
  //   status, register_date, certificates_issued, wallet_address }
};

// 9. PUT /api/universities/:id/suspend
export const suspendUniversityAPI = async (id) => {
  const res = await fetch(
    `${BASE_URL}/api/universities/${id}/suspend`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` }
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to suspend');
  return data;
  // Returns: { message }
};

// 10. PUT /api/universities/:id/reactivate
export const reactivateUniversityAPI = async (id) => {
  const res = await fetch(
    `${BASE_URL}/api/universities/${id}/reactivate`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` }
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to reactivate');
  return data;
  // Returns: { message }
};
