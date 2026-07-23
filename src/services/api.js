import axios from 'axios';
import { getAuthHeaders, getStoredToken, handleUnauthorized } from '../utils/authToken';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const resData = response.data;
    // Nếu response có dạng cấu trúc ApiResponse chuẩn { code, message, data }
    if (resData && typeof resData === 'object' && 'code' in resData && 'message' in resData) {
      if ('data' in resData) {
        return resData.data; // trả về data nghiệp vụ
      }
      return resData; // trả về cả object nếu không có data field (ví dụ MessageResponse)
    }
    return resData; // trả về raw data của axios (ví dụ không bọc wrapper)
  },
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export { getAuthHeaders };
export default api;
