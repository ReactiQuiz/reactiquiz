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

  // --- START OF THE ROBUST FIX ---
  // This useEffect runs only ONCE on initial app load.
  useEffect(() => {
    try {
      // 1. Try to get the user object and token from localStorage.
      const storedUser = localStorage.getItem('reactiquizUser');
      const token = localStorage.getItem('reactiquizToken');

      if (storedUser && token) {
        // 2. If they exist, parse the user and set it as the current user synchronously.
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      // If parsing fails, clear storage to be safe.
      console.error("Failed to parse stored user data", error);
      localStorage.removeItem('reactiquizUser');
      localStorage.removeItem('reactiquizToken');
    } finally {
      // 3. Signal that authentication loading is complete.
      // This happens almost instantly, preventing crashes.
      setIsLoadingAuth(false);
    }
  }, []);

  const signIn = async (username, password) => {
    const response = await apiClient.post('/api/users/login', { username, password });
    const { token, user } = response.data;
    
    // 4. On successful login, save BOTH token AND user object to localStorage.
    localStorage.setItem('reactiquizToken', token);
    localStorage.setItem('reactiquizUser', JSON.stringify(user));
    
    setCurrentUser(user);
    return response;
  };
  
  const signOut = useCallback(() => {
    // 5. On sign out, clear BOTH token AND user object.
    localStorage.removeItem('reactiquizToken');
    localStorage.removeItem('reactiquizUser');
    setCurrentUser(null);
    // Redirect to login to clear all component state.
    window.location.href = '/login';
  }, []);

  const updateCurrentUserDetails = useCallback((newDetails) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...newDetails };
      // 6. When updating details, also update the user object in localStorage.
      localStorage.setItem('reactiquizUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const signUp = async (userData) => {
    return apiClient.post('/api/users/register', userData);
  };
  // --- END OF THE ROBUST FIX ---

  const value = {
    currentUser,
    isLoadingAuth,
    signIn,
    signUp,
    signOut,
    updateCurrentUserDetails,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};