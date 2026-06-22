import { getAuthHeaders, handleUnauthorized } from '../utils/authToken';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

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

  if (response.status === 204) return null;
  return response.json();
}

export function fetchUserStats() {
  return request('/admin/users/stats');
}

export function fetchUsers({ role = 'ALL', status, search, page = 0, size = 10 }) {
  const params = new URLSearchParams({ role, page, size });
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  return request(`/admin/users?${params}`);
}

export function createUser(payload) {
  return request('/admin/users', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateUser(id, payload) {
  return request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function banUser(id, reason) {
  return request(`/admin/users/${id}/ban`, {
    method: 'PATCH',
    body: JSON.stringify({ reason: reason || null }),
  });
}

export function unbanUser(id) {
  return request(`/admin/users/${id}/unban`, { method: 'PATCH' });
}

export function approveUser(id) {
  return request(`/admin/users/${id}/approve`, { method: 'PATCH' });
}
