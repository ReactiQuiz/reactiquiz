// src/api/axiosInstance.js
import axios from 'axios';

// Resolve a safe baseURL. If a localhost URL was injected at build time, ignore it in production.
const resolveBaseURL = () => {
  const envBase = (process.env.REACT_APP_API_BASE_URL || '').trim();
  const isLocalhostEnv = /^(https?:\/\/)?(localhost|127\.0\.0\.1)/i.test(envBase);
  if (process.env.NODE_ENV === 'production') {
    if (isLocalhostEnv) {
      // Use same-origin in production to hit Vercel serverless functions under /api
      return '';
    }
    // If a non-localhost env base is provided, use it; otherwise same-origin
    return envBase || '';
  }
  // In development, prefer provided env base (e.g., http://localhost:3001), else same-origin
  return envBase || '';
};

const apiClient = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000,
});

// Request Interceptor: To add the JWT to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('reactiquizToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: To handle token expiration globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the server responds with 401 Unauthorized, the token is invalid/expired.
    if (error.response && error.response.status === 401) {
      // Avoid redirect loop when already on auth routes
      const isAuthRoute = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
      // --- START OF FIX: Only remove the token. AuthContext handles the user object. ---
      localStorage.removeItem('reactiquizToken');
      // --- END OF FIX ---
      if (!isAuthRoute) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;