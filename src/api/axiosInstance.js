// src/api/axiosInstance.js

import axios from 'axios';

// The full URL of your deployed Vercel backend API
const VERCEL_BACKEND_URL = 'https://reactiquiz.vercel.app/api'; 

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || VERCEL_BACKEND_URL,
});

export default apiClient;