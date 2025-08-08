// src/hooks/useSubjects.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { useSubjects } from './useSubjects';
import apiClient from '../api/axiosInstance';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the entire apiClient module
jest.mock('../api/axiosInstance');

// Mock react-router's useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain all non-mocked modules
  useNavigate: () => mockNavigate,
}));

// A wrapper component that provides the QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockSubjectsData = [
  { id: 1, name: 'Physics', description: 'Study of matter.' },
  { id: 2, name: 'Chemistry', description: 'Study of reactions.' },
];

describe('useSubjects hook', () => {
  it('should return loading state initially and then the fetched subjects', async () => {
    // Configure the mock to return our test data
    apiClient.get.mockResolvedValue({ data: mockSubjectsData });

    const { result } = renderHook(() => useSubjects(), { wrapper: createWrapper() });

    // 1. Initial state: check that it's loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.subjects).toEqual([]);

    // 2. Wait for the hook to finish its async operation (fetching data)
    await waitFor(() => {
        // Assert that loading is now false and data is populated
        expect(result.current.isLoading).toBe(false);
        expect(result.current.subjects).toEqual(mockSubjectsData);
    });
  });

  it('should return an error state if the API call fails', async () => {
    // Configure the mock to simulate a network error
    apiClient.get.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useSubjects(), { wrapper: createWrapper() });

    // Wait for the hook to settle into its error state
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Network Error');
      expect(result.current.subjects).toEqual([]);
    });
  });
});