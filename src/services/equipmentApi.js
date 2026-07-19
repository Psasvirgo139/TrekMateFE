import api from './api';

// ─── Categories ────────────────────────────────────────────────────────────
export const fetchCategories = () =>
  api.get('/admin/equipment/categories');

export const createCategory = (data) =>
  api.post('/admin/equipment/categories', data);

export const updateCategory = (id, data) =>
  api.put(`/admin/equipment/categories/${id}`, data);

export const deleteCategory = (id) =>
  api.delete(`/admin/equipment/categories/${id}`);

// ─── Equipment ─────────────────────────────────────────────────────────────
export const fetchEquipments = (params = {}) =>
  api.get('/admin/equipment', { params });

export const fetchEquipment = (id) =>
  api.get(`/admin/equipment/${id}`);

export const createEquipment = (data) =>
  api.post('/admin/equipment', data);

export const updateEquipment = (id, data) =>
  api.put(`/admin/equipment/${id}`, data);

export const toggleEquipmentActive = (id) =>
  api.patch(`/admin/equipment/${id}/toggle`);

export const deleteEquipment = (id) =>
  api.delete(`/admin/equipment/${id}`);

// ─── Rentals ───────────────────────────────────────────────────────────────
export const fetchEquipmentRentals = (equipmentId, params = {}) =>
  api.get(`/admin/equipment/${equipmentId}/rentals`, { params });

export const fetchAllRentals = (params = {}) =>
  api.get('/admin/equipment/rentals', { params });

export const returnRental = (rentalId, data) =>
  api.patch(`/admin/equipment/rentals/${rentalId}/return`, data);

// ─── Public Equipment ────────────────────────────────────────────────────────
export const fetchAvailableEquipments = (params = {}) =>
  api.get('/v1/rental/equipments', { params });
