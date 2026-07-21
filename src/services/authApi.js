import api from './api';
import { clearToken, getStoredToken, storeToken } from '../utils/authToken';

// Re-export token utilities for backward compatibility with AuthContext
export { clearToken, getStoredToken, storeToken };

export function login({ email, password, rememberMe = false }) {
  return api.post('/auth/login', { email, password, rememberMe });
}

export function googleLogin({ idToken, rememberMe = false }) {
  return api.post('/auth/google', { idToken, rememberMe });
}

export function requestRegistrationOtp({ email, password, displayName, phone, role }) {
  return api.post('/auth/register/request-otp', { email, password, displayName, phone, role });
}

export function verifyRegistration({ email, otp }) {
  return api.post('/auth/register/verify', { email, otp });
}

export function forgotPassword({ email }) {
  return api.post('/auth/forgot-password', { email });
}

export function resetPassword({ email, otp, newPassword }) {
  return api.post('/auth/reset-password', { email, otp, newPassword });
}

export function getMe() {
  return api.get('/auth/me');
}
