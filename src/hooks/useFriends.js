// src/hooks/useFriends.js
import { useState } from 'react';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
// --- START OF TANSTACK QUERY IMPORTS ---
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// --- END OF TANSTACK QUERY IMPORTS ---

// --- Fetcher functions defined outside the hook ---
const fetchFriendsList = async () => {
  const { data } = await apiClient.get('/api/friends');
  return data || [];
};

const fetchPendingRequests = async () => {
  const { data } = await apiClient.get('/api/friends/requests/pending');
  return data || [];
};

export const useFriends = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient(); // <-- Hook to access the query cache

  // --- State for UI Dialogs ---
  const [unfriendConfirmationOpen, setUnfriendConfirmationOpen] = useState(false);
  const [friendToUnfriend, setFriendToUnfriend] = useState(null);

  // --- 1. Refactor Data Fetching with useQuery ---
  const { data: friendsList = [], isLoading: isLoadingFriends, error: friendsError } = useQuery({
    queryKey: ['friends'],
    queryFn: fetchFriendsList,
    enabled: !!currentUser // Only run this query if the user is logged in
  });

  const { data: pendingRequests = [], isLoading: isLoadingRequests, error: requestsError } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: fetchPendingRequests,
    enabled: !!currentUser
  });

  // --- 2. Refactor Actions (Mutations) with useMutation ---
  const respondToRequestMutation = useMutation({
    mutationFn: ({ requestId, action }) => apiClient.put(`/api/friends/request/${requestId}`, { action }),
    onSuccess: () => {
      // When the mutation is successful, invalidate these queries.
      // This tells TanStack Query to automatically refetch the data.
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    }
  });

  const unfriendMutation = useMutation({
    mutationFn: (friendId) => apiClient.delete(`/api/friends/unfriend/${friendId}`),
    onSuccess: () => {
      // Invalidate friends list on success
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      closeUnfriendConfirmation();
    }
  });

  // --- 3. Update Handlers to use the mutations ---
  const handleRespondToRequest = (requestId, action) => {
    respondToRequestMutation.mutate({ requestId, action });
  };
  
  const openUnfriendConfirmation = (friend) => {
    setFriendToUnfriend(friend);
    setUnfriendConfirmationOpen(true);
  };
  
  const closeUnfriendConfirmation = () => {
    setFriendToUnfriend(null);
    setUnfriendConfirmationOpen(false);
  };

  const handleConfirmUnfriend = () => {
    if (!friendToUnfriend) return;
    unfriendMutation.mutate(friendToUnfriend.friendId);
  };

  return {
    // Data and states from useQuery
    friendsList,
    isLoadingFriends,
    friendsError: friendsError ? friendsError.message : null,
    pendingRequests,
    isLoadingRequests,
    requestsError: requestsError ? requestsError.message : null,
    
    // UI state for dialogs
    unfriendConfirmationOpen,
    friendToUnfriend,
    
    // Mutation states (for showing loading indicators on buttons, etc.)
    isRespondingToRequest: respondToRequestMutation.isPending,
    respondRequestError: respondToRequestMutation.error,
    isUnfriending: unfriendMutation.isPending,
    unfriendError: unfriendMutation.error,

    // Handlers
    handleRespondToRequest,
    openUnfriendConfirmation,
    closeUnfriendConfirmation,
    handleConfirmUnfriend,
  };
};