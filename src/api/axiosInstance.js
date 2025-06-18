// src/api/axiosInstance.js
import axios from 'axios';

// This configuration works for BOTH local development (with the proxy)
// and for the final Vercel deployment.
const apiClient = axios.create({
  baseURL: '/api',
});

export default apiClient;