// src/api/__mocks__/axiosInstance.js

// This is the mock version of our API client.
// It exports an object with functions that are Jest mock functions (jest.fn()).
// This allows our tests to run without making real network requests.
const apiClient = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

export default apiClient;