import api from './api';

/**
 * Lấy danh sách tour công khai (phân trang & tìm kiếm)
 * @param {Object} params - page, size, search, difficulty, status
 */
export const fetchPublicTours = async (params = {}) => {
  return api.get('/tours', { params });
};

/**
 * Lấy chi tiết một tour công khai theo UUID hoặc Slug
 * @param {string} idOrSlug - UUID hoặc Slug của tour
 */
export const fetchPublicTourDetail = async (idOrSlug) => {
  return api.get(`/tours/${idOrSlug}`);
};

/**
 * Lấy danh sách các đợt khởi hành của tour (OPEN/SCHEDULED)
 * @param {string} tourIdOrSlug - ID hoặc slug của tour
 */
export const fetchDeparturesByTour = async (tourIdOrSlug) => {
  return api.get(`/tours/${tourIdOrSlug}/departures`);
};
