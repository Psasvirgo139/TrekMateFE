import api from './api';

/**
 * Lấy danh sách lịch sử đặt tour của người dùng hiện tại (phân trang)
 * @param {Object} params - Gồm page (0-indexed) và size
 */
export const fetchMyBookings = async (params = {}) => {
  const response = await api.get('/v1/bookings/my-bookings', { params });
  return response.data?.data; // Trả về Page<BookingHistoryResponse>
};

/**
 * Lấy thông tin chi tiết của một đơn đặt tour
 * @param {number|string} id - ID của booking
 */
export const fetchBookingDetail = async (id) => {
  const response = await api.get(`/v1/bookings/${id}`);
  return response.data?.data; // Trả về BookingDetailResponse
};

/**
 * Hủy một đơn đặt tour
 * @param {number|string} id - ID của booking
 * @param {string} reason - Lý do hủy
 */
export const cancelBooking = async (id, reason) => {
  const response = await api.post(`/v1/bookings/${id}/cancel`, { reason });
  return response.data?.data; // Trả về BookingDetailResponse
};

/**
 * Tạo đơn đặt tour mới
 * @param {Object} payload - { departureId, numParticipants, isJoinTour, participantsInfo, specialRequests }
 */
export const createBooking = async (payload) => {
  const response = await api.post('/v1/bookings', payload);
  return response.data?.data; // Trả về BookingDetailResponse
};

import { fetchDeparturesByTour } from './tourApi';
export { fetchDeparturesByTour };
