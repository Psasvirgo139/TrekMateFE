import api from './api';

/**
 * Thực hiện thanh toán thủ công (manual)
 * @param {Object} payload - Thông tin thanh toán
 */
export const makePayment = async (payload) => {
  const response = await api.post('/v1/payments', payload);
  return response.data?.data;
};

/**
 * Tạo link thanh toán PayOS
 * @param {Object} payload - Thông tin giao dịch
 */
export const createPayOSPayment = async (payload) => {
  const response = await api.post('/v1/payments/payos/create', payload);
  return response.data?.data;
};

/**
 * Xác nhận trạng thái thanh toán PayOS sau khi redirect về
 * @param {number|string} orderCode - Mã giao dịch PayOS
 */
export const confirmPayOSPayment = async (orderCode) => {
  const response = await api.get(`/v1/payments/payos/confirm/${orderCode}`);
  return response.data?.data;
};

/**
 * Xác nhận thanh toán thủ công (admin/guide)
 * @param {Object} payload - Thông tin xác thực
 */
export const confirmManualPayment = async (payload) => {
  const response = await api.post('/v1/payments/manual-confirm', payload);
  return response.data?.data;
};
