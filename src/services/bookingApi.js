import api from './api';

/**
 * Lấy danh sách lịch sử đặt tour của người dùng hiện tại (phân trang)
 * @param {Object} params - Gồm page (0-indexed) và size
 */
export const fetchMyBookings = async (params = {}) => {
  return api.get('/v1/bookings/my-bookings', { params });
};

/**
 * Lấy thông tin chi tiết của một đơn đặt tour
 * @param {number|string} id - ID của booking
 */
export const fetchBookingDetail = async (id) => {
  return api.get(`/v1/bookings/${id}`);
};

/**
 * Hủy một đơn đặt tour
 * @param {number|string} id - ID của booking
 * @param {string} reason - Lý do hủy
 */
export const cancelBooking = async (id, reason) => {
  return api.post(`/v1/bookings/${id}/cancel`, { reason });
};

/**
 * Tạo đơn đặt tour mới
 * @param {Object} payload - { departureId, numParticipants, isJoinTour, participantsInfo, specialRequests }
 */
export const createBooking = async (payload) => {
  return api.post('/v1/bookings', payload);
};

import { fetchDeparturesByTour } from './tourApi';
export { fetchDeparturesByTour };
