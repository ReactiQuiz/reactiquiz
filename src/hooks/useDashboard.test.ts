// src/hooks/useDashboard.test.ts

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { useDashboard } from './useDashboard';
import { mockUser } from '../test-utils';
import apiClient from '../api/axiosInstance';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockUser,
  }),
}));

// Mock the report generator
jest.mock('../utils/reportGenerator', () => ({
  generateDashboardPdfReport: jest.fn().mockResolvedValue(undefined),
}));

// Mock API responses
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockSubjects = [
  {
    id: 'physics',
    name: 'Physics',
    subjectKey: 'physics',
    description: 'Classical and modern physics',
    accentColorDark: '#1976d2',
    accentColorLight: '#42a5f5',
    icon: '⚛️',
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    subjectKey: 'chemistry',
    description: 'Organic and inorganic chemistry',
    accentColorDark: '#388e3c',
    accentColorLight: '#66bb6a',
    icon: '🧪',
  },
];

const mockTopics = [
  {
    id: 'topic-1',
    name: 'Mechanics',
    subject_id: 'physics',
    class: '12',
    genre: 'Classical Physics',
    description: 'Laws of motion, forces, and energy',
    questionCount: 25,
  },
];

const mockResults = [
  {
    id: 'result-1',
    userId: mockUser.id,
    topicId: 'topic-1',
    topicName: 'Mechanics',
    subject: 'Physics',
    difficulty: 'Medium',
    totalQuestions: 10,
    correctAnswers: 8,
    score: 32,
    percentage: 80,
    timeSpent: 600,
    createdAt: new Date().toISOString(),
    userAnswers: { q1: 0, q2: 1 },
    questions: [],
  },
  {
    id: 'result-2',
    userId: mockUser.id,
    topicId: 'topic-1',
    topicName: 'Mechanics',
    subject: 'Physics',
    difficulty: 'Hard',
    totalQuestions: 15,
    correctAnswers: 10,
    score: 40,
    percentage: 66.7,
    timeSpent: 900,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    userAnswers: {},
    questions: [],
  },
];

describe('useDashboard Hook', () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
          staleTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
      logger: {
        log: () => {},
        warn: () => {},
        error: () => {},
      },
    });

    // Setup default mock responses
    mockApiClient.get.mockImplementation((url: string) => {
      if (url === '/api/results') {
        return Promise.resolve({ data: mockResults });
      }
      if (url === '/api/subjects') {
        return Promise.resolve({ data: mockSubjects });
      }
      if (url === '/api/topics') {
        return Promise.resolve({ data: mockTopics });
      }
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper,
    });

    expect(result.current.isLoadingData).toBe(true);
    expect(result.current.timeFrequency).toBe('month');
    expect(result.current.selectedSubject).toBe('all');
    expect(result.current.processedStats).toBeNull();
    expect(result.current.isGeneratingPdf).toBe(false);
  });

  it('fetches data successfully', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoadingData).toBe(false);
    });

    expect(result.current.allSubjects).toHaveLength(2);
    expect(result.current.allSubjects[0].name).toBe('Physics');
  });

  it('changes time frequency correctly', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoadingData).toBe(false);
    });

    // Change time frequency to week
    act(() => {
      result.current.handleTimeFrequencyChange('week');
    });
    expect(result.current.timeFrequency).toBe('week');

    // Change time frequency to year
    act(() => {
      result.current.handleTimeFrequencyChange('year');
    });
    expect(result.current.timeFrequency).toBe('year');

    // Invalid frequency should not change state
    act(() => {
      result.current.handleTimeFrequencyChange('invalid');
    });
    expect(result.current.timeFrequency).toBe('year');
  });

  it('changes selected subject correctly', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoadingData).toBe(false);
    });

    act(() => {
      result.current.handleSubjectChange('Physics');
    });
    expect(result.current.selectedSubject).toBe('Physics');
  });

  it('processes stats correctly when data is available', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoadingData).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.processedStats).not.toBeNull();
    });

    const stats = result.current.processedStats!;
    expect(stats.totalQuizzes).toBe(2);
    expect(stats.overallAverageScore).toBeGreaterThan(0);
    expect(stats.overallQuestionStats.total).toBeGreaterThan(0);
  });

  it('handles empty data gracefully', async () => {
    // Mock empty responses
    mockApiClient.get.mockImplementation(() => {
      return Promise.resolve({ data: [] });
    });

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoadingData).toBe(false);
    });

    expect(result.current.processedStats).toBeNull();
    expect(result.current.allSubjects).toHaveLength(0);
  });

  it('generates PDF report successfully', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoadingData).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.processedStats).not.toBeNull();
    });

    // Generate PDF
    expect(result.current.isGeneratingPdf).toBe(false);
    
    await act(async () => {
      await result.current.handleGenerateReport();
    });
    
    // PDF generation should complete
    expect(result.current.isGeneratingPdf).toBe(false);
  });

  it('filters data by time frequency correctly', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoadingData).toBe(false);
    });

    // Change to week frequency
    act(() => {
      result.current.handleTimeFrequencyChange('week');
    });

    await waitFor(() => {
      expect(result.current.processedStats).not.toBeNull();
    });

    const weekStats = result.current.processedStats!;
    
    // Change to year frequency
    act(() => {
      result.current.handleTimeFrequencyChange('year');
    });

    await waitFor(() => {
      expect(result.current.processedStats).not.toBeNull();
    });

    const yearStats = result.current.processedStats!;
    
    // Year stats should have more or equal data than week stats
    expect(yearStats.totalQuizzes).toBeGreaterThanOrEqual(weekStats.totalQuizzes);
  });

  it('filters data by subject correctly', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoadingData).toBe(false);
    });

    // Filter by specific subject
    act(() => {
      result.current.handleSubjectChange('Physics');
    });

    await waitFor(() => {
      expect(result.current.processedStats).not.toBeNull();
    });

    const physicsStats = result.current.processedStats!;
    
    // Change back to all subjects
    act(() => {
      result.current.handleSubjectChange('all');
    });

    await waitFor(() => {
      expect(result.current.processedStats).not.toBeNull();
    });

    const allStats = result.current.processedStats!;
    
    // All subjects should have more or equal data than filtered
    expect(allStats.totalQuizzes).toBeGreaterThanOrEqual(physicsStats.totalQuizzes);
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    mockApiClient.get.mockImplementation(() => {
      return Promise.reject(new Error('Internal server error'));
    });

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoadingData).toBe(false);
    });

    // Hook should handle errors gracefully
    expect(result.current.error).toBe(null); // Current implementation doesn't expose errors
  });

  it('provides correct ref objects', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper,
    });

    expect(result.current.activityChartRef.current).toBeNull();
    expect(result.current.topicPerformanceRef.current).toBeNull();
    expect(result.current.rollingAverageChartRef.current).toBeNull();
    expect(result.current.difficultyBreakdownChartRef.current).toBeNull();
  });
});