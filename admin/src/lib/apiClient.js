// admin/src/lib/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // All requests will be prefixed with /api
});

// IMPORTANT: This interceptor will not work in Server Components.
// It is intended for use in 'use client' components where localStorage is available.
apiClient.interceptors.request.use(
  (config) => {
    // Check if window is defined (ensures this runs only on the client-side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('reactiquizToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;