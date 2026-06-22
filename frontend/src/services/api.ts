import axios from 'axios';

// Base URL configured from Environment variables, with a standard localhost fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Logs out request details during debugging/development
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} -> ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Catches errors and formats clean error messages
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} <- ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;
