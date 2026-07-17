import api from './api';

export function fetchUserStats() {
  return api.get('/admin/users/stats').then((r) => r.data.data);
}

export function fetchUsers({ role = 'ALL', status, search, page = 0, size = 10 }) {
  const params = { role, page, size };
  if (status) params.status = status;
  if (search) params.search = search;
  return api.get('/admin/users', { params }).then((r) => r.data.data);
}

export function createUser(payload) {
  return api.post('/admin/users', payload).then((r) => r.data.data);
}

export function updateUser(id, payload) {
  return api.patch(`/admin/users/${id}`, payload).then((r) => r.data.data);
}

export function banUser(id, reason) {
  return api.patch(`/admin/users/${id}/ban`, { reason: reason || null }).then((r) => r.data.data);
}

export function unbanUser(id) {
  return api.patch(`/admin/users/${id}/unban`).then((r) => r.data.data);
}

export function approveUser(id) {
  return api.patch(`/admin/users/${id}/approve`).then((r) => r.data.data);
}
