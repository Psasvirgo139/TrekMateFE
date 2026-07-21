import api from './api';

export function fetchDashboardStats() {
  return api.get('/admin/dashboard/stats');
}
