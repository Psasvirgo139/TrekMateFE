import api from './api';

/**
 * Fetch locations list by search keyword
 * @param {string} search - Search query keyword
 * @returns {Promise} Axios promise
 */
export const getLocations = (search) => {
  const params = {};
  if (search && search.trim() !== '') {
    params.search = search.trim();
  }
  return api.get('/locations', { params });
};

/**
 * Create a new location
 * @param {object} locationData - Location details { name, description }
 * @returns {Promise} Axios promise
 */
export const createLocation = (locationData) => {
  return api.post('/locations', locationData);
};
