import api from './api';

/**
 * Fetch paginated approved reviews for a tour
 * @param {string} tourId - Tour UUID
 * @param {Object} params - Query params (page, size, sortBy)
 */
export const fetchReviewsByTour = async (tourId, params = {}) => {
  const response = await api.get(`/reviews/tour/${tourId}`, { params });
  return response.data?.data;
};

/**
 * Fetch review summary (avg ratings and distribution) for a tour
 * @param {string} tourId - Tour UUID
 */
export const fetchReviewSummary = async (tourId) => {
  const response = await api.get(`/reviews/tour/${tourId}/summary`);
  return response.data?.data;
};

/**
 * Create a new review
 * @param {Object} payload - Review data
 */
export const createReview = async (payload) => {
  const response = await api.post('/reviews', payload);
  return response.data?.data;
};

/**
 * Toggle helpful state on a review
 * @param {number|string} reviewId - Review ID
 */
export const toggleHelpful = async (reviewId) => {
  const response = await api.post(`/reviews/${reviewId}/helpful`);
  return response.data?.data;
};

/**
 * Delete a review (owner or admin)
 * @param {number|string} reviewId - Review ID
 */
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

/**
 * Guide reply to a review
 * @param {number|string} reviewId - Review ID
 * @param {Object} payload - { guideReply }
 */
export const replyToReview = async (reviewId, payload) => {
  const response = await api.patch(`/reviews/${reviewId}/reply`, payload);
  return response.data?.data;
};
