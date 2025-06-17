// src/api/axiosInstance.js

import axios from 'axios';

// The full URL of your deployed Vercel backend API
const VERCEL_BACKEND_URL = 'https://reactiquiz.vercel.app'; 

const apiClient = axios.create({
  baseURL: VERCEL_BACKEND_URL,
});

export default apiClient;