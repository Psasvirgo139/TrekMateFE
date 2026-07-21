import api from './api';

export const getGuideDepartures = () => api.get('/guide/departures');

export const getDepartureParticipants = (departureId) => 
  api.get(`/guide/departures/${departureId}/participants`);

export const startTour = (departureId, attendanceData) => 
  api.post(`/guide/departures/${departureId}/start`, attendanceData);

export const updateAttendance = (departureId, attendanceData) => 
  api.post(`/guide/departures/${departureId}/attendance`, attendanceData);

export const completeTour = (departureId) => 
  api.post(`/guide/departures/${departureId}/complete`);
