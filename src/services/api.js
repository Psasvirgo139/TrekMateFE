import axios from 'axios';

// Create a common Axios instance config
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Base API path of TrekMateBE
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor: Automatically inject Authorization token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized error handling and token validation check
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Global error handler
    console.error('API Interceptor Error:', error.response || error.message);
    if (error.response) {
      // Handle unauthorized or expired token (e.g. status 401)
      if (error.response.status === 401) {
        // Option: Clear token and redirect to login if necessary
        // localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
