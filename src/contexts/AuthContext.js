// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiClient from '../api/axiosInstance';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('reactiquizToken');
    if (token) {
      apiClient.get('/api/users/me')
        .then(response => {
          setCurrentUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('reactiquizToken');
          setCurrentUser(null);
        })
        .finally(() => {
          setIsLoadingAuth(false);
        });
    } else {
      setIsLoadingAuth(false);
    }
  }, []);

  const signIn = async (username, password) => {
    const response = await apiClient.post('/api/users/login', { username, password });
    const { token, user } = response.data;
    localStorage.setItem('reactiquizToken', token);
    setCurrentUser(user);
    return response;
  };
  
  const signUp = async (userData) => {
    return apiClient.post('/api/users/register', userData);
  };

  const signOut = useCallback(() => {
    localStorage.removeItem('reactiquizToken');
    setCurrentUser(null);
    window.location.href = '/login';
  }, []);

  // --- START OF FIX: Create a controlled update function ---
  const updateCurrentUserDetails = useCallback((newDetails) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...newDetails };
      // Also update the user data in localStorage to persist across reloads
      localStorage.setItem('reactiquizUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);
  // --- END OF FIX ---

  const value = {
    currentUser,
    isLoadingAuth,
    signIn,
    signUp,
    signOut,
    updateCurrentUserDetails, // <-- Expose the new function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};