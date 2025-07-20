// src/api/axiosInstance.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/',
});

// 1. Request Interceptor: To add the JWT to every outgoing request
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

// 2. Response Interceptor: To handle token expiration globally
apiClient.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // If the server responds with 401 Unauthorized, it means the token is invalid or expired
    if (error.response && error.response.status === 401) {
      // Clear the invalid token and user data
      localStorage.removeItem('reactiquizToken');
      localStorage.removeItem('reactiquizUser');
      // Redirect the user to the login page
      // We use window.location to force a full page reload, clearing all component state.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;