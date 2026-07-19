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

/**
 * Lấy dự báo thời tiết theo ngày cho một departure cụ thể.
 * @param {string} departureId - UUID của departure
 */
export const fetchDepartureWeather = async (departureId) => {
  return api.get(`/v1/weather/departure/${departureId}`);
};

/**
 * Lấy gợi ý trang bị từ AI (Gemini) cho một departure.
 * Items có sẵn trong kho cho thuê sẽ được đánh dấu isAvailableForRent = true.
 * @param {string} departureId - UUID của departure
 */
export const fetchAiGearRecommendation = async (departureId) => {
  return api.get(`/v1/weather/departure/${departureId}/ai-recommendation`);
};

import { fetchDeparturesByTour } from './tourApi';
export { fetchDeparturesByTour };

