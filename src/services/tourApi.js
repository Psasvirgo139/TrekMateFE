import api from './api';

/**
 * Lấy danh sách tour công khai (phân trang & tìm kiếm)
 * @param {Object} params - page, size, search, difficulty, status
 */
export const fetchPublicTours = async (params = {}) => {
  const response = await api.get('/tours', { params });
  return response.data?.data;
};

/**
 * Lấy chi tiết một tour công khai theo UUID hoặc Slug
 * @param {string} idOrSlug - UUID hoặc Slug của tour
 */
export const fetchPublicTourDetail = async (idOrSlug) => {
  const response = await api.get(`/tours/${idOrSlug}`);
  return response.data?.data;
};

/**
 * Lấy danh sách các đợt khởi hành của tour (OPEN/SCHEDULED)
 * @param {string} tourIdOrSlug - ID hoặc slug của tour
 */
export const fetchDeparturesByTour = async (tourIdOrSlug) => {
  const response = await api.get(`/tours/${tourIdOrSlug}/departures`);
  return response.data?.data || [];
};
