import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

export default api;
