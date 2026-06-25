import api from './api';

// CRUD Tour APIs
export const getTours = (params) => api.get('/admin/tours', { params });
export const getTourDetail = (idOrSlug) => api.get(`/admin/tours/${idOrSlug}`);
export const createTour = (tourData) => api.post('/admin/tours', tourData);
export const updateTour = (id, tourData) => api.put(`/admin/tours/${id}`, tourData);
export const deleteTour = (id) => api.delete(`/admin/tours/${id}`);

// Waypoints APIs
export const addWaypoint = (tourId, waypointData) =>
  api.post(`/admin/tours/${tourId}/waypoints`, waypointData);
export const updateWaypoint = (tourId, waypointId, waypointData) =>
  api.put(`/admin/tours/${tourId}/waypoints/${waypointId}`, waypointData);
export const deleteWaypoint = (tourId, waypointId) =>
  api.delete(`/admin/tours/${tourId}/waypoints/${waypointId}`);

// Daily Itinerary APIs
export const saveItinerary = (tourId, itineraryData) =>
  api.post(`/admin/tours/${tourId}/itineraries`, itineraryData);
export const deleteItinerary = (tourId, itineraryId) =>
  api.delete(`/admin/tours/${tourId}/itineraries/${itineraryId}`);

// Images APIs
export const addTourImage = (tourId, imageData) =>
  api.post(`/admin/tours/${tourId}/images`, imageData);
export const deleteTourImage = (tourId, imageId) =>
  api.delete(`/admin/tours/${tourId}/images/${imageId}`);
