// src/hooks/useDashboardData.ts
/**
 * Dashboard Data Hook
 * 
 * This hook fetches and manages all data required for the user dashboard,
 * including quiz results and available subjects.
 */
import { useState, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { parseISO, isValid } from 'date-fns';

/**
 * useDashboardData Hook
 * 
 * Custom hook that fetches and manages dashboard data for the authenticated user.
 * Fetches user's quiz results and all available subjects concurrently for
 * better performance. Validates and processes the data before setting it in state.
 * 
 * @param {object | null} currentUser - The currently authenticated user object.
 *                                      Must have id and token properties.
 * @returns {object} An object containing:
 *   - userResults: Array of user's quiz results
 *   - allSubjects: Array of all available subjects
 *   - isLoadingData: Boolean indicating if data is currently loading
 *   - error: String error message if data fetch fails
 *   - fetchDashboardData: Function to manually refetch dashboard data
 */
export const useDashboardData = (currentUser) => {
  // State for user's quiz results
  const [userResults, setUserResults] = useState([]);
  // State for all available subjects
  const [allSubjects, setAllSubjects] = useState([]);
  // State for loading indicator
  const [isLoadingData, setIsLoadingData] = useState(true);
  // State for error messages
  const [error, setError] = useState('');

  /**
   * Fetch Dashboard Data
   * 
   * Fetches user's quiz results and all subjects concurrently from the API.
   * Processes and validates the data before setting it in state.
   * 
   * This function:
   * 1. Validates currentUser has required properties
   * 2. Fetches results and subjects concurrently
   * 3. Processes results (converts percentage to float, validates timestamps)
   * 4. Validates data format
   * 5. Updates state or sets error
   * 
   * @returns {Promise<void>} Promise that resolves when data fetch completes
   */
  const fetchDashboardData = useCallback(async () => {
    // Early return if user is not authenticated or missing required properties
    if (!currentUser || !currentUser.id || !currentUser.token) {
      setIsLoadingData(false);
      setUserResults([]);
      setAllSubjects([]);
      return;
    }
    
    setIsLoadingData(true);
    setError('');

    try {
      // Fetch both results and subjects concurrently for better performance
      const [resultsRes, subjectsRes] = await Promise.all([
        // Fetch user-specific results with authentication token
        apiClient.get(`/api/results?userId=${currentUser.id}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }),
        // Fetch all available subjects (public data)
        apiClient.get('/api/subjects'),
      ]);

      // Process results: convert percentage to float and validate timestamps
      if (Array.isArray(resultsRes.data)) {
        const processedResults = resultsRes.data
          .map(r => ({ ...r, percentage: parseFloat(r.percentage) })) // Convert percentage string to number
          .filter(r => !isNaN(r.percentage) && isValid(parseISO(r.timestamp))); // Filter invalid data
        setUserResults(processedResults);
      } else {
        throw new Error('Received invalid data format for your results.');
      }
      
      // Process subjects: validate data format
      if (Array.isArray(subjectsRes.data)) {
        setAllSubjects(subjectsRes.data);
      } else {
        throw new Error('Received invalid data format for subjects.');
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      // Extract error message from response or use default
      setError(`Failed to load dashboard data: ${err.response?.data?.message || err.message}`);
      // Clear data on error
      setUserResults([]);
      setAllSubjects([]);
    } finally {
      // Always stop loading regardless of success or failure
      setIsLoadingData(false);
    }
  }, [currentUser]);

  return { 
    userResults, 
    allSubjects, 
    isLoadingData, 
    error, 
    fetchDashboardData 
  };
};