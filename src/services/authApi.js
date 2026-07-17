import api from './api';
import { clearToken, getStoredToken, storeToken } from '../utils/authToken';

// Re-export token utilities for backward compatibility with AuthContext
export { clearToken, getStoredToken, storeToken };

export function login({ email, password, rememberMe = false }) {
  return api.post('/auth/login', { email, password, rememberMe }).then((r) => r.data.data);
}

export function googleLogin({ idToken, rememberMe = false }) {
  return api.post('/auth/google', { idToken, rememberMe }).then((r) => r.data.data);
}

export function requestRegistrationOtp({ email, password, displayName, phone, role }) {
  return api.post('/auth/register/request-otp', { email, password, displayName, phone, role }).then((r) => r.data.data);
}

export function verifyRegistration({ email, otp }) {
  return api.post('/auth/register/verify', { email, otp }).then((r) => r.data.data);
}

export function forgotPassword({ email }) {
  return api.post('/auth/forgot-password', { email }).then((r) => r.data.data);
}

export function resetPassword({ email, otp, newPassword }) {
  return api.post('/auth/reset-password', { email, otp, newPassword }).then((r) => r.data.data);
}

export function getMe() {
  return api.get('/auth/me').then((r) => r.data.data);
}
