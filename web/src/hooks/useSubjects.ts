// src/hooks/useSubjects.ts
/**
 * Subjects Hook
 * 
 * This hook manages subjects state and functionality for viewing
 * and searching subjects. It provides subject listing, searching,
 * and navigation to individual subject pages.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { UseSubjectsReturn, Subject } from '../types';

/**
 * Fetch Subjects
 * 
 * Fetches all subjects from the API. Validates that the response
 * is an array before returning.
 * 
 * @returns {Promise<Subject[]>} Promise that resolves to an array of subjects
 * @throws {Error} If the API response is not an array
 */
const fetchSubjects = async (): Promise<Subject[]> => {
  const { data } = await apiClient.get<Subject[]>('/api/subjects');
  // Validate data format
  if (!Array.isArray(data)) {
    throw new Error('Invalid data format received for subjects.');
  }
  return data;
};

/**
 * useSubjects Hook
 * 
 * Custom hook that manages subjects listing functionality. Provides:
 * - Fetching all subjects from API
 * - Searching subjects by name or key
 * - Navigating to individual subject pages
 * 
 * @returns {UseSubjectsReturn} Subjects data, loading state, search functionality, and handlers
 */
export const useSubjects = (): UseSubjectsReturn => {
  // Navigation hook for routing to subject pages
  const navigate = useNavigate();
  // State for search term (user input for filtering subjects)
  const [searchTerm, setSearchTerm] = useState<string>('');

  /**
   * Fetch Subjects Query
   * 
   * Uses React Query to fetch all subjects from the API.
   * Results are cached and shared across components.
   */
  const { data: subjects = [], isLoading, isError, error } = useQuery({
    queryKey: ['subjects'], // Cache key for subjects
    queryFn: fetchSubjects // Fetch function
  });

  /**
   * Handle Explore Subject
   * 
   * Navigates to a specific subject's topics page.
   * 
   * @param {string} subjectKey - The subject key identifier (e.g., 'physics', 'chemistry')
   */
  const handleExploreSubject = (subjectKey: string): void => {
    navigate(`/subjects/${subjectKey}`);
  };

  /**
   * Handle Search Term Change
   * 
   * Updates the search term state when user types in the search input.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
   */
  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  /**
   * Filter Subjects
   * 
   * Filters subjects based on the search term. Searches in both
   * subject name and subject key (case-insensitive).
   * 
   * Memoized to recalculate only when subjects or search term changes.
   * 
   * @returns {Subject[]} Filtered array of subjects matching the search term
   */
  const filteredSubjects = useMemo(() => {
    // Return all subjects if search term is empty
    if (!searchTerm.trim()) return subjects;
    
    // Filter subjects by name or subjectKey (case-insensitive)
    return subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subjectKey.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subjects, searchTerm]);

  return {
    subjects, // All subjects from API
    isLoading, // Loading state from query
    error: isError ? (error as Error).message : null, // Error message or null
    searchTerm, // Current search term
    filteredSubjects, // Subjects filtered by search term
    handleExploreSubject, // Handler for navigating to subject page
    handleSearchTermChange, // Handler for updating search term
  };
};
