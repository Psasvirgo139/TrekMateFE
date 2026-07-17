import api from './api';

/**
 * Fetch paginated approved reviews for a tour
 * @param {string} tourId - Tour UUID
 * @param {Object} params - Query params (page, size, sortBy)
 */
export const fetchReviewsByTour = async (tourId, params = {}) => {
  return api.get(`/reviews/tour/${tourId}`, { params });
};

/**
 * Fetch review summary (avg ratings and distribution) for a tour
 * @param {string} tourId - Tour UUID
 */
export const fetchReviewSummary = async (tourId) => {
  return api.get(`/reviews/tour/${tourId}/summary`);
};

/**
 * Create a new review
 * @param {Object} payload - Review data
 */
export const createReview = async (payload) => {
  return api.post('/reviews', payload);
};

/**
 * Toggle helpful state on a review
 * @param {number|string} reviewId - Review ID
 */
export const toggleHelpful = async (reviewId) => {
  return api.post(`/reviews/${reviewId}/helpful`);
};

/**
 * Delete a review (owner or admin)
 * @param {number|string} reviewId - Review ID
 */
export const deleteReview = async (reviewId) => {
  return api.delete(`/reviews/${reviewId}`);
};

/**
 * Guide reply to a review
 * @param {number|string} reviewId - Review ID
 * @param {Object} payload - { guideReply }
 */
export const replyToReview = async (reviewId, payload) => {
  return api.patch(`/reviews/${reviewId}/reply`, payload);
};
