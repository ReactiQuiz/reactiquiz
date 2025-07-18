// src/api/axiosInstance.js
import axios from 'axios';

const apiClient = axios.create({
  // Use a relative URL. This is the key.
  // In development, the proxy in package.json will catch this and forward to localhost:3001.
  // In production, Vercel will route /api/... to your serverless functions.
  baseURL: '/', 
});

// If you have a Supabase auth token, you can set it here globally
// apiClient.interceptors.request.use(config => {
//   const token = getSupabaseTokenFromStorage(); // Your logic to get the token
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default apiClient;