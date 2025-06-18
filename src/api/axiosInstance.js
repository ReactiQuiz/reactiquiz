// src/api/axiosInstance.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://reactiquiz.vercel.app',
});

export default apiClient;