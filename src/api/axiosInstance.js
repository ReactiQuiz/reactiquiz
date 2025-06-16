// --- FULL CODE for src/api/axiosInstance.js ---

import axios from 'axios';

// On Vercel, the frontend and API are on the same domain.
// We make relative requests to our own serverless functions.
const apiClient = axios.create({
  baseURL: '/api', // This is the correct setting for Vercel
});

// REMOVED: No need for process.env.REACT_APP_API_BASE_URL
// The baseURL will now correctly resolve to https://your-site.vercel.app/api

export default apiClient;