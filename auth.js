import { buildApiUrl } from "./api";

export const loginRequest = async (email, password) => {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const response = await fetch(buildApiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.detail || "Login failed");
    error.status = response.status;
    throw error;
  }

  return data;
};

export const getMeRequest = async (token) => {
  const response = await fetch(buildApiUrl("/api/auth/me"), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.detail || "Unable to load user");
    error.status = response.status;
    throw error;
  }

  return data;
};

export const logoutRequest = async (token) => {
  const response = await fetch(buildApiUrl("/api/auth/logout"), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Logout request failed");
  }

  return response.json().catch(() => ({}));
};

