import api from './api';

// ─── Categories ────────────────────────────────────────────────────────────
export const fetchCategories = () =>
  api.get('/admin/equipment/categories').then(r => r.data);

export const createCategory = (data) =>
  api.post('/admin/equipment/categories', data).then(r => r.data);

export const updateCategory = (id, data) =>
  api.put(`/admin/equipment/categories/${id}`, data).then(r => r.data);

export const deleteCategory = (id) =>
  api.delete(`/admin/equipment/categories/${id}`);

// ─── Equipment ─────────────────────────────────────────────────────────────
export const fetchEquipments = (params = {}) =>
  api.get('/admin/equipment', { params }).then(r => r.data);

export const fetchEquipment = (id) =>
  api.get(`/admin/equipment/${id}`).then(r => r.data);

export const createEquipment = (data) =>
  api.post('/admin/equipment', data).then(r => r.data);

export const updateEquipment = (id, data) =>
  api.put(`/admin/equipment/${id}`, data).then(r => r.data);

export const toggleEquipmentActive = (id) =>
  api.patch(`/admin/equipment/${id}/toggle`).then(r => r.data);

export const deleteEquipment = (id) =>
  api.delete(`/admin/equipment/${id}`);

// ─── Rentals ───────────────────────────────────────────────────────────────
export const fetchEquipmentRentals = (equipmentId, params = {}) =>
  api.get(`/admin/equipment/${equipmentId}/rentals`, { params }).then(r => r.data);

export const fetchAllRentals = (params = {}) =>
  api.get('/admin/equipment/rentals', { params }).then(r => r.data);

export const returnRental = (rentalId, data) =>
  api.patch(`/admin/equipment/rentals/${rentalId}/return`, data).then(r => r.data);
