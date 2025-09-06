// src/api/axiosInstance.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/',
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