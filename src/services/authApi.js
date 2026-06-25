import {
  clearToken,
  getAuthHeaders,
  getStoredToken,
  handleUnauthorized,
  storeToken,
} from '../utils/authToken';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export { clearToken, getStoredToken, storeToken };

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Session expired. Please sign in again.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${response.status})`);
  }

  return response.json();
}

export function login({ email, password, rememberMe = false }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, rememberMe }),
  });
}

export function googleLogin({ idToken, rememberMe = false }) {
  return request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken, rememberMe }),
  });
}

export function requestRegistrationOtp({ email, password, displayName, phone, role }) {
  return request('/auth/register/request-otp', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName, phone, role }),
  });
}

export function verifyRegistration({ email, otp }) {
  return request('/auth/register/verify', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

export function forgotPassword({ email }) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword({ email, otp, newPassword }) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword }),
  });
}

export function getMe() {
  return request('/auth/me');
}


