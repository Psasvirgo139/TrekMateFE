import api from './api';

// CRUD Tour APIs
export const getTours = (params) => api.get('/admin/tours/all', { params }).then(r => r.data.data);
export const getTourDetail = (idOrSlug) => api.get(`/admin/tours/${idOrSlug}`).then(r => r.data.data);
export const createTour = (tourData) => api.post('/admin/tours', tourData).then(r => r.data.data);
export const updateTour = (id, tourData) => api.put(`/admin/tours/${id}`, tourData).then(r => r.data.data);
export const deleteTour = (id) => api.delete(`/admin/tours/${id}`).then(r => r.data);
export const getTourCloneSource = (id) => api.get(`/admin/tours/${id}/clone-source`).then(r => r.data.data);

// Waypoints APIs
export const addWaypoint = (tourId, waypointData) =>
  api.post(`/admin/tours/${tourId}/waypoints`, waypointData).then(r => r.data.data);
export const updateWaypoint = (tourId, waypointId, waypointData) =>
  api.put(`/admin/tours/${tourId}/waypoints/${waypointId}`, waypointData).then(r => r.data.data);
export const deleteWaypoint = (tourId, waypointId) =>
  api.delete(`/admin/tours/${tourId}/waypoints/${waypointId}`).then(r => r.data);

// Daily Itinerary APIs
export const saveItinerary = (tourId, itineraryData) =>
  api.post(`/admin/tours/${tourId}/itineraries`, itineraryData).then(r => r.data.data);
export const deleteItinerary = (tourId, itineraryId) =>
  api.delete(`/admin/tours/${tourId}/itineraries/${itineraryId}`).then(r => r.data);

// Images APIs
export const addTourImage = (tourId, imageData) =>
  api.post(`/admin/tours/${tourId}/images`, imageData).then(r => r.data.data);
export const deleteTourImage = (tourId, imageId) =>
  api.delete(`/admin/tours/${tourId}/images/${imageId}`).then(r => r.data);

// Departure APIs
export const getTourDepartures = (tourId, params) =>
  api.get(`/admin/tours/${tourId}/departures`, { params }).then(r => r.data.data);
export const createDeparture = (tourId, departureData) =>
  api.post(`/admin/tours/${tourId}/departures`, departureData).then(r => r.data.data);
export const generateBulkDepartures = (tourId, bulkData) =>
  api.post(`/admin/tours/${tourId}/departures/bulk`, bulkData).then(r => r.data.data);
export const updateDeparture = (tourId, departureId, departureData) =>
  api.put(`/admin/tours/${tourId}/departures/${departureId}`, departureData).then(r => r.data.data);
export const deleteDeparture = (tourId, departureId) =>
  api.delete(`/admin/tours/${tourId}/departures/${departureId}`).then(r => r.data);

// Guide Assignment APIs
export const getAvailableGuides = (startDate, endDate, excludeDepartureId) =>
  api.get('/admin/tour-guides/available', { params: { startDate, endDate, excludeDepartureId } }).then(r => r.data.data);
export const getGuideSchedules = (startDate, endDate) =>
  api.get('/admin/tour-guides/schedules', { params: { startDate, endDate } }).then(r => r.data.data);
