// src/api/axiosInstance.js
import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const PROD_BACKEND_BASE_URL = 'https://reactiquiz.vercel.app'; // Your Vercel URL

let effectiveBaseURL;

if (isProduction) {
  effectiveBaseURL = PROD_BACKEND_BASE_URL;
} else {
  // For development, point to the frontend's host.
  // The proxy will intercept paths starting with /api.
  effectiveBaseURL = 'http://localhost:3001';
}

const apiClient = axios.create({
  baseURL: effectiveBaseURL,
});

export default apiClient;