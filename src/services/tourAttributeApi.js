import api from './api';

/**
 * Fetch tour attributes list by type and search keyword
 * @param {string} type - Tour attribute type (HIGHLIGHT, INCLUDE, EXCLUDE, REQUIREMENT)
 * @param {string} search - Search query keyword
 * @returns {Promise} Axios promise
 */
export const getTourAttributes = (type, search) => {
  const params = { type };
  if (search && search.trim() !== '') {
    params.search = search.trim();
  }
  return api.get('/tour-attributes', { params }).then(r => r.data.data);
};

/**
 * Create a new tour attribute
 * @param {object} attributeData - Attribute details { content, type }
 * @returns {Promise} Axios promise
 */
export const createTourAttribute = (attributeData) => {
  return api.post('/tour-attributes', attributeData).then(r => r.data.data);
};
