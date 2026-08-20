// src/api/axiosInstance.ts
/**
 * Axios Instance Configuration
 * 
 * This file creates a configured Axios instance for making HTTP requests to the backend API.
 * It includes request and response interceptors for authentication and error handling.
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Resolve Base URL
 *
 * Determines the base URL for all API requests. Respects REACT_APP_API_BASE_URL
 * (set by `npm start` to point at a local backend) so local development doesn't
 * silently read and write live production data; falls back to the deployed
 * Vercel API for production builds.
 *
 * @returns {string} The base URL for API requests
 */
const resolveBaseURL = (): string => {
  return process.env.REACT_APP_API_BASE_URL || '';
};

/**
 * API Client Instance
 * 
 * Creates an Axios instance with default configuration:
 * - baseURL: Backend API base URL
 * - timeout: 15 seconds - requests will timeout after this duration
 * 
 * This instance is used throughout the application for all HTTP requests.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000, // 15 second timeout for all requests
});

/**
 * Request Interceptor
 * 
 * Automatically attaches JWT authentication token to every outgoing request.
 * The token is retrieved from localStorage and added as a Bearer token in the
 * Authorization header.
 * 
 * Flow:
 * 1. Extract token from localStorage
 * 2. If token exists and headers are available, add Authorization header
 * 3. Return modified config or reject on error
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Retrieve JWT token from localStorage
    const token = localStorage.getItem('reactiquizToken');
    // Add token to Authorization header if token exists and headers are available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Reject request errors immediately
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles global error responses, specifically token expiration (401 Unauthorized).
 * When a 401 error is received, it removes the invalid token and redirects to login,
 * unless the user is already on an authentication route.
 * 
 * Flow:
 * 1. On successful response, return response as-is
 * 2. On error response:
 *    - If 401 (Unauthorized): Token is invalid/expired
 *    - Remove token from localStorage
 *    - Redirect to login (unless already on auth route to prevent loops)
 * 3. Reject all errors to allow component-level error handling
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Pass through successful responses unchanged
    return response;
  },
  (error: AxiosError<any>): Promise<AxiosError> => {
    // If no response is received (network failure, CORS, offline)
    if (!error.response) {
      if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
        error.message = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else {
        error.message = 'The server is taking too long to respond. Please try again.';
      }
    } else if (error.response.status === 401) {
      // Avoid redirect loop when already on auth routes
      const isAuthRoute = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
      // Remove token and user data from localStorage
      localStorage.removeItem('reactiquizToken');
      localStorage.removeItem('reactiquizUser');
      // Redirect to login only if not already on an auth route
      if (!isAuthRoute) {
        window.location.href = '/login';
      }
    } else if (error.response.status === 429) {
      if (error.response.data && !error.response.data.message) {
        error.response.data.message = 'You have made too many requests. Please wait a moment and try again.';
      }
    } else if (error.response.status === 500) {
      if (!error.response.data?.message) {
        if (!error.response.data) error.response.data = {};
        error.response.data.message = 'A server error occurred. Please try again in a few moments.';
      }
    }
    // Reject error to allow component-level error handling
    return Promise.reject(error);
  }
);

export default apiClient;
