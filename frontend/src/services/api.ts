import axios from 'axios';

// Base URL configured from Environment variables, with a standard localhost fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Logs out request details during debugging/development
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} -> ${config.url}`, config.data || '');
    }
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API Request Error]', error);
    }
    const message =
    error.response?.data?.message ||
    error.message ||
    "Unexpected server error";

    return Promise.reject(new Error(message));
  }
);

// Response Interceptor: Catches errors and formats clean error messages
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status} <- ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', error.response || error.message);
    }
    const message =
    error.response?.data?.message ||
    error.message ||
    "Unexpected server error";

    return Promise.reject(new Error(message));
  }
);

export default api;
