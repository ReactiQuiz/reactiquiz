// src/hooks/useFriends.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

/**
 * A custom hook to manage all state and logic for the Friends page.
 * It handles fetching friends, pending requests, and actions like
 * responding to requests and unfriending.
 */
export const useFriends = () => {
  const { currentUser } = useAuth();

  // --- State for Friends List ---
  const [friendsList, setFriendsList] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [friendsError, setFriendsError] = useState('');

  // --- State for Pending Requests ---
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState('');

  // --- State for UI Feedback and Dialogs ---
  const [responseMessage, setResponseMessage] = useState({ type: '', text: '' });
  const [unfriendConfirmationOpen, setUnfriendConfirmationOpen] = useState(false);
  const [friendToUnfriend, setFriendToUnfriend] = useState(null);

  // --- Utility to clear messages ---
  const clearMessages = useCallback(() => {
    setResponseMessage({ type: '', text: '' });
  }, []);

  // --- Data Fetching ---
  const fetchAllFriendData = useCallback(async () => {
    if (!currentUser?.token) return;
    
    // Reset state before fetching
    clearMessages();
    setIsLoadingFriends(true);
    setIsLoadingRequests(true);

    try {
      const [friendsRes, requestsRes] = await Promise.all([
        apiClient.get('/api/friends', { headers: { Authorization: `Bearer ${currentUser.token}` } }),
        apiClient.get('/api/friends/requests/pending', { headers: { Authorization: `Bearer ${currentUser.token}` } })
      ]);
      setFriendsList(friendsRes.data || []);
      setPendingRequests(requestsRes.data || []);
      setFriendsError('');
      setRequestsError('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to load friend data.";
      setFriendsError(errorMsg);
      setRequestsError(errorMsg);
      console.error("Error fetching friend data:", err);
    } finally {
      setIsLoadingFriends(false);
      setIsLoadingRequests(false);
    }
  }, [currentUser?.token, clearMessages]);

  useEffect(() => {
    fetchAllFriendData();
  }, [fetchAllFriendData]);

  // --- Event Handlers ---
  const handleRespondToRequest = async (requestId, action) => {
    clearMessages();
    try {
      await apiClient.put(`/api/friends/request/${requestId}`, { action }, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      setResponseMessage({ type: 'success', text: `Request ${action}ed successfully.` });
      fetchAllFriendData(); // Refresh all data after action
    } catch (err) {
      setResponseMessage({ type: 'error', text: err.response?.data?.message || `Failed to ${action} request.` });
    }
  };

  const openUnfriendConfirmation = (friend) => {
    setFriendToUnfriend(friend);
    setUnfriendConfirmationOpen(true);
  };
  
  const closeUnfriendConfirmation = () => {
    setFriendToUnfriend(null);
    setUnfriendConfirmationOpen(false);
  };

  const handleConfirmUnfriend = async () => {
    if (!friendToUnfriend) return;
    clearMessages();
    try {
      await apiClient.delete(`/api/friends/unfriend/${friendToUnfriend.friendId}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      setResponseMessage({ type: 'success', text: `${friendToUnfriend.friendUsername} has been unfriended.` });
      fetchAllFriendData(); // Refresh list after unfriending
    } catch (err) {
      setResponseMessage({ type: 'error', text: err.response?.data?.message || 'Failed to unfriend user.' });
    } finally {
      closeUnfriendConfirmation();
    }
  };
  
  // Note: Logic for FriendSearch is self-contained in that component.
  // This hook focuses on the data displayed in the lists on FriendsPage.

  return {
    friendsList,
    isLoadingFriends,
    friendsError,
    pendingRequests,
    isLoadingRequests,
    requestsError,
    responseMessage,
    unfriendConfirmationOpen,
    friendToUnfriend,
    handleRespondToRequest,
    openUnfriendConfirmation,
    closeUnfriendConfirmation,
    handleConfirmUnfriend,
  };
};