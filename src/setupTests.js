// src/setupTests.js

import '@testing-library/jest-dom';
import apiClient from './api/axiosInstance';

jest.mock('./api/axiosInstance');

beforeEach(() => {
  apiClient.get.mockClear();
  
  apiClient.get.mockImplementation((url) => {
    // This default mock is still useful for any components
    // that might make unexpected API calls.
    return Promise.resolve({ data: {} });
  });
});