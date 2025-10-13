// src/api/axiosInstance.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Always use Vercel backend URL for all API requests
const resolveBaseURL = (): string => {
  return 'https://reactiquiz.vercel.app';
};

const apiClient: AxiosInstance = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000,
});

// Request Interceptor: To add the JWT to every outgoing request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('reactiquizToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response Interceptor: To handle token expiration globally
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // If the server responds with 401 Unauthorized, the token is invalid/expired.
    if (error.response && error.response.status === 401) {
      // Avoid redirect loop when already on auth routes
      const isAuthRoute = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
      // Only remove the token. AuthContext handles the user object.
      localStorage.removeItem('reactiquizToken');
      if (!isAuthRoute) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
