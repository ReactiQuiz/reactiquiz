// src/hooks/useResults.ts
/**
 * Results Hook
 * 
 * This hook manages quiz results state and functionality for viewing
 * historical results and result details. It provides filtering, sorting,
 * and result detail viewing capabilities.
 */
import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { useTopics } from '../contexts/TopicsContext';
import { UseResultsReturn, QuizResult } from '../types';

/**
 * Fetch All Results
 * 
 * Fetches all quiz results for the current user from the API.
 * 
 * @returns {Promise<QuizResult[]>} Promise that resolves to an array of quiz results
 */
const fetchAllResults = async (): Promise<QuizResult[]> => {
  const { data } = await apiClient.get<QuizResult[]>('/api/results');
  return data || [];
};

/**
 * useResults Hook
 * 
 * Custom hook that manages quiz results viewing functionality. Provides:
 * - Fetching all user results
 * - Fetching individual result details
 * - Filtering results by subject, difficulty, class, and genre
 * - Sorting results by date or score
 * - Processing results with topic information
 * 
 * @returns {UseResultsReturn} Results list, detail data, filters, sorting, and handlers
 */
export const useResults = (): UseResultsReturn => {
  // Get resultId from URL parameters (for detail view)
  const { resultId } = useParams<{ resultId?: string }>();
  // Authentication context for current user
  const { currentUser } = useAuth();
  // Topics context for enriching results with topic information
  const { topics: allTopics } = useTopics();

  // State for filter settings (subject, class, genre)
  const [filters, setFilters] = useState<{ subject: string; class: string; genre: string }>({ 
    subject: 'all', // Filter by subject (or 'all' for no filter)
    class: 'all', // Filter by class (or 'all' for no filter)
    genre: 'all' // Filter by genre (or 'all' for no filter)
  });
  
  // State for sort order
  const [sortOrder, setSortOrder] = useState<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'>('date_desc');

  /**
   * Clear Filters
   * 
   * Resets all filters and sort order to default values.
   * This function is memoized with useCallback to maintain referential stability.
   */
  const clearFilters = useCallback((): void => {
    // Reset all filters to 'all' (no filter)
    setFilters({ subject: 'all', class: 'all', genre: 'all' });
    // Reset sort order to date_desc
    setSortOrder('date_desc');
  }, []);

  /**
   * Fetch All Results Query
   * 
   * Uses React Query to fetch all quiz results for the current user.
   * Only enabled when user is authenticated.
   */
  const { data: allResults = [], isLoading: isLoadingList, error: listError } = useQuery({
    queryKey: ['userResults', currentUser?.id], // Cache key includes user ID
    queryFn: fetchAllResults, // Fetch function
    enabled: !!currentUser, // Only fetch if user is authenticated
  });

  /**
   * Fetch Result Detail Query
   * 
   * Uses React Query to fetch a specific result's detail data.
   * Only enabled when resultId is available.
   */
  const { data: detailData, isLoading: isLoadingDetail, error: detailError } = useQuery({
    queryKey: ['resultDetail', resultId], // Cache key includes result ID
    queryFn: async () => {
      // Early return if no resultId
      if (!resultId) return null;
      // Fetch specific result detail from API
      const { data } = await apiClient.get<QuizResult>(`/api/results/${resultId}`);
      return data;
    },
    enabled: !!resultId, // Only fetch if resultId exists
  });

  /**
   * Process Results
   * 
   * Enriches results with topic information from topics context.
   * Adds topic name, subject, class, and genre to each result.
   * Memoized to recalculate only when results or topics change.
   */
  const processedResults = useMemo(() => {
    // Return empty array if no results
    if (!allResults || allResults.length === 0) return [];

    // Map results and enrich with topic data
    return allResults.map(result => {
      // Find matching topic by topicId
      const topic = allTopics.find(t => t.id === result.topicId);

      // Handle fallback topicName for Homi Bhabha & dynamic tests
      let fallbackTopicName = result.topicName;
      if (!fallbackTopicName || fallbackTopicName === 'Unknown Topic') {
        if (result.topicId && result.topicId.startsWith('pyq-')) {
          const parts = result.topicId.split('-');
          fallbackTopicName = `Homi Bhabha PYQ Std ${parts[1]}th (${parts[2]})`;
        } else if (result.topicId && result.topicId.startsWith('homibhabha-practice-')) {
          const parts = result.topicId.split('-');
          fallbackTopicName = `Homi Bhabha Practice Test - Std ${parts[2]}th`;
        } else if (result.topicId) {
          fallbackTopicName = result.topicId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
      }

      return {
        ...result,
        topicName: topic?.name || fallbackTopicName || 'Practice Quiz',
        subject: topic?.subject_id || result.subject || 'general',
        class: topic?.class || (result.class ? `Class ${result.class}` : 'Class 6-10'),
        genre: topic?.genre || 'Curriculum',
      };
    });
  }, [allResults, allTopics]);

  /**
   * Filter Results
   * 
   * Filters processed results based on current filter settings.
   * Results must match all active filters (subject, class, genre).
   * Memoized to recalculate only when results or filters change.
   */
  const filteredResults = useMemo(() => {
    return processedResults.filter(result => {
      // Check if result matches each filter (or filter is 'all')
      const matchesSubject = filters.subject === 'all' || result.subject === filters.subject;
      const matchesClass = filters.class === 'all' || result.class === filters.class;
      const matchesGenre = filters.genre === 'all' || result.genre === filters.genre;
      // Result must match all active filters
      return matchesSubject && matchesClass && matchesGenre;
    });
  }, [processedResults, filters]);

  /**
   * Sort Results
   * 
   * Sorts filtered results based on the selected sort order.
   * Supports sorting by date (newest/oldest) or score (high/low).
   * Memoized to recalculate only when filtered results or sort order changes.
   */
  const sortedResults = useMemo(() => {
    const sorted = [...filteredResults];
    switch (sortOrder) {
      case 'date_desc':
      case 'newest' as any:
        return sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      case 'date_asc':
      case 'oldest' as any:
        return sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      case 'score_desc':
      case 'score-high' as any:
        return sorted.sort((a, b) => (b.percentage || b.score || 0) - (a.percentage || a.score || 0));
      case 'score_asc':
      case 'score-low' as any:
        return sorted.sort((a, b) => (a.percentage || a.score || 0) - (b.percentage || b.score || 0));
      default:
        return sorted;
    }
  }, [filteredResults, sortOrder]);

  /**
   * Available Classes
   * 
   * Extracts unique class values from processed results for filter dropdowns.
   * Memoized to recalculate only when processed results change.
   */
  const availableClasses = useMemo(() => {
    // Extract unique class values
    const classes = Array.from(new Set(processedResults.map(r => r.class)));
    // Sort alphabetically
    return classes.sort();
  }, [processedResults]);

  /**
   * Available Genres
   * 
   * Extracts unique genre values from processed results for filter dropdowns.
   * Memoized to recalculate only when processed results change.
   */
  const availableGenres = useMemo(() => {
    // Extract unique genre values
    const genres = Array.from(new Set(processedResults.map(r => r.genre)));
    // Sort alphabetically
    return genres.sort();
  }, [processedResults]);

  // Combined loading state (true if either list or detail is loading)
  const isLoading = isLoadingList || isLoadingDetail;
  // Combined error state (list error or detail error)
  const error = listError?.message || detailError?.message || null;

  return {
    historicalList: sortedResults, // Sorted and filtered results list
    detailData: detailData || null, // Individual result detail data (or null)
    isLoading, // Combined loading state
    error, // Combined error state
    filters, // Current filter settings
    setFilters, // Function to update filters
    sortOrder, // Current sort order
    setSortOrder, // Function to update sort order
    availableClasses, // Unique classes for filter dropdown
    availableGenres, // Unique genres for filter dropdown
    clearFilters, // Function to reset all filters
  };
};