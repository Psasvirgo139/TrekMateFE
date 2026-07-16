import api from './api';

// CRUD Tour APIs
export const getTours = (params) => api.get('/admin/tours/all', { params });
export const getTourDetail = (idOrSlug) => api.get(`/admin/tours/${idOrSlug}`);
export const createTour = (tourData) => api.post('/admin/tours', tourData);
export const updateTour = (id, tourData) => api.put(`/admin/tours/${id}`, tourData);
export const deleteTour = (id) => api.delete(`/admin/tours/${id}`);
export const getTourCloneSource = (id) => api.get(`/admin/tours/${id}/clone-source`);

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

// Departure APIs
export const getTourDepartures = (tourId, params) =>
  api.get(`/admin/tours/${tourId}/departures`, { params });
export const createDeparture = (tourId, departureData) =>
  api.post(`/admin/tours/${tourId}/departures`, departureData);
export const generateBulkDepartures = (tourId, bulkData) =>
  api.post(`/admin/tours/${tourId}/departures/bulk`, bulkData);
export const updateDeparture = (tourId, departureId, departureData) =>
  api.put(`/admin/tours/${tourId}/departures/${departureId}`, departureData);
export const deleteDeparture = (tourId, departureId) =>
  api.delete(`/admin/tours/${tourId}/departures/${departureId}`);

// Guide Assignment APIs
export const getAvailableGuides = (startDate, endDate, excludeDepartureId) =>
  api.get('/admin/tour-guides/available', { params: { startDate, endDate, excludeDepartureId } });
export const getGuideSchedules = (startDate, endDate) =>
  api.get('/admin/tour-guides/schedules', { params: { startDate, endDate } });
