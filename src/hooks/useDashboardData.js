// src/hooks/useDashboardData.js
import { useState, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { parseISO, isValid } from 'date-fns';

/**
 * A custom hook to fetch and manage all data required for the user dashboard.
 * @param {object | null} currentUser - The currently authenticated user object.
 * @returns {object} An object containing the dashboard data, loading/error states, and a function to refetch data.
 */
export const useDashboardData = (currentUser) => {
  const [userResults, setUserResults] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
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
        apiClient.get(`/api/results?userId=${currentUser.id}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }),
        apiClient.get('/api/subjects'),
      ]);

      // Process results
      if (Array.isArray(resultsRes.data)) {
        const processedResults = resultsRes.data
          .map(r => ({ ...r, percentage: parseFloat(r.percentage) }))
          .filter(r => !isNaN(r.percentage) && isValid(parseISO(r.timestamp)));
        setUserResults(processedResults);
      } else {
        throw new Error('Received invalid data format for your results.');
      }
      
      // Process subjects
      if (Array.isArray(subjectsRes.data)) {
        setAllSubjects(subjectsRes.data);
      } else {
        throw new Error('Received invalid data format for subjects.');
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(`Failed to load dashboard data: ${err.response?.data?.message || err.message}`);
      setUserResults([]);
      setAllSubjects([]);
    } finally {
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