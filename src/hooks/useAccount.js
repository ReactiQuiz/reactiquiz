// src/hooks/useAccount.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext'; // We'll get user details from here

/**
 * A custom hook to manage all state and logic for the logged-in user's Account page.
 * @returns {object} An object containing all the state, derived data, and handlers needed by the AccountPage component.
 */
export const useAccount = () => {
  const { currentUser } = useAuth(); // Get the user from the auth context

  // --- State for ChangeDetailsModal ---
  const [changeDetailsModalOpen, setChangeDetailsModalOpen] = useState(false);

  // --- State for User Stats ---
  const [userStats, setUserStats] = useState({
    totalQuizzesSolved: 0,
    overallAveragePercentage: 0,
    activityData: [],
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  // --- Data Fetching Logic ---
  const fetchUserAccountStats = useCallback(async () => {
    // Check for currentUser and token inside the callback
    if (!currentUser || !currentUser.token) {
      setUserStats({ totalQuizzesSolved: 0, overallAveragePercentage: 0, activityData: [] });
      setIsLoadingStats(false);
      return;
    }
    setIsLoadingStats(true);
    setStatsError('');
    try {
      const response = await apiClient.get('/api/users/stats', {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setUserStats({
        totalQuizzesSolved: response.data.totalQuizzesSolved || 0,
        overallAveragePercentage: response.data.overallAveragePercentage || 0,
        activityData: response.data.activityData || [],
      });
    } catch (error) {
      console.error("Error fetching user account stats:", error);
      setStatsError(error.response?.data?.message || "Failed to load your statistics.");
      // Reset stats on error to avoid showing stale data
      setUserStats({ totalQuizzesSolved: 0, overallAveragePercentage: 0, activityData: [] });
    } finally {
      setIsLoadingStats(false);
    }
  }, [currentUser]); // Dependency is on the currentUser object

  // Effect to trigger data fetching when the user is available
  useEffect(() => {
    if (currentUser) {
      fetchUserAccountStats();
    } else {
      // If user logs out, clear the stats
      setUserStats({ totalQuizzesSolved: 0, overallAveragePercentage: 0, activityData: [] });
      setStatsError('');
      setIsLoadingStats(false);
    }
  }, [currentUser, fetchUserAccountStats]);

  // --- Modal Handlers ---
  const handleOpenChangeDetailsModal = () => setChangeDetailsModalOpen(true);
  const handleCloseChangeDetailsModal = () => setChangeDetailsModalOpen(false);

  // --- Return all state and handlers needed by the component ---
  return {
    userStats,
    isLoadingStats,
    statsError,
    changeDetailsModalOpen,
    handleOpenChangeDetailsModal,
    handleCloseChangeDetailsModal,
  };
};