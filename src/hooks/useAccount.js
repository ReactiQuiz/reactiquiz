// src/hooks/useAccount.js
import { useState } from 'react';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
// --- TANSTACK QUERY ---
import { useQuery } from '@tanstack/react-query';

// Fetcher function
const fetchUserAccountStats = async () => {
  // The axios interceptor automatically adds the auth token
  const { data } = await apiClient.get('/api/users/stats');
  return data;
};

export const useAccount = () => {
  const { currentUser } = useAuth();

  // --- UI State (Modals) ---
  const [changeDetailsModalOpen, setChangeDetailsModalOpen] = useState(false);

  // --- Data Fetching with useQuery ---
  const { 
    data: userStats, 
    isLoading: isLoadingStats, 
    isError,
    error: statsErrorData 
  } = useQuery({
    queryKey: ['userStats', currentUser?.id], // Query key includes user ID
    queryFn: fetchUserAccountStats,
    enabled: !!currentUser, // Only fetch if a user is logged in
    // Default initial data to prevent errors on first render
    initialData: {
      totalQuizzesSolved: 0,
      overallAveragePercentage: 0,
      activityData: [],
    }
  });

  // --- Modal Handlers ---
  const handleOpenChangeDetailsModal = () => setChangeDetailsModalOpen(true);
  const handleCloseChangeDetailsModal = () => setChangeDetailsModalOpen(false);

  return {
    userStats,
    isLoadingStats,
    statsError: isError ? statsErrorData.message : null,
    changeDetailsModalOpen,
    handleOpenChangeDetailsModal,
    handleCloseChangeDetailsModal,
  };
};