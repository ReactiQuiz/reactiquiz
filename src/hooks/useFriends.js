// src/hooks/useFriends.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

export const useFriends = () => {
  const { currentUser } = useAuth();

  // State for Friends List
  const [friendsList, setFriendsList] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true); // Start as true
  const [friendsError, setFriendsError] = useState('');

  // State for Pending Requests
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true); // Start as true
  const [requestsError, setRequestsError] = useState('');

  // State for UI Feedback and Dialogs
  const [responseMessage, setResponseMessage] = useState({ type: '', text: '' });
  const [unfriendConfirmationOpen, setUnfriendConfirmationOpen] = useState(false);
  const [friendToUnfriend, setFriendToUnfriend] = useState(null);

  const clearMessages = useCallback(() => {
    setResponseMessage({ type: '', text: '' });
  }, []);

  // --- START OF FIX: SEPARATE FETCH FUNCTIONS ---

  const fetchFriendsList = useCallback(async () => {
    if (!currentUser?.token) {
        setIsLoadingFriends(false);
        return;
    }
    setIsLoadingFriends(true);
    setFriendsError('');
    try {
      const response = await apiClient.get('/api/friends', {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setFriendsList(response.data || []);
    } catch (err) {
      setFriendsError(err.response?.data?.message || "Error fetching friends list.");
      console.error("Error fetching friends:", err.response || err);
    } finally {
      setIsLoadingFriends(false);
    }
  }, [currentUser?.token]);

  const fetchPendingRequests = useCallback(async () => {
    if (!currentUser?.token) {
        setIsLoadingRequests(false);
        return;
    }
    setIsLoadingRequests(true);
    setRequestsError('');
    try {
      const response = await apiClient.get('/api/friends/requests/pending', {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setPendingRequests(response.data || []);
    } catch (err) {
      setRequestsError(err.response?.data?.message || "Error fetching pending requests.");
      console.error("Error fetching pending requests:", err.response || err);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [currentUser?.token]);

  // Main useEffect to trigger both fetches
  useEffect(() => {
    if (currentUser) {
      fetchFriendsList();
      fetchPendingRequests();
    } else {
      // Clear data and stop loading if user logs out
      setFriendsList([]);
      setPendingRequests([]);
      setIsLoadingFriends(false);
      setIsLoadingRequests(false);
      setFriendsError('');
      setRequestsError('');
    }
  }, [currentUser, fetchFriendsList, fetchPendingRequests]);

  // --- END OF FIX ---

  const handleRespondToRequest = async (requestId, action) => {
    clearMessages();
    try {
      await apiClient.put(`/api/friends/request/${requestId}`, { action }, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      setResponseMessage({ type: 'success', text: `Request ${action}ed successfully.` });
      // Refresh both lists after an action
      fetchFriendsList();
      fetchPendingRequests();
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
      fetchFriendsList(); // Refresh list after unfriending
    } catch (err) {
      setResponseMessage({ type: 'error', text: err.response?.data?.message || 'Failed to unfriend user.' });
    } finally {
      closeUnfriendConfirmation();
    }
  };

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