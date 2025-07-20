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

  // This effect runs on initial app load to restore the session
  useEffect(() => {
    const token = localStorage.getItem('reactiquizToken');
    if (token) {
      // We have a token, now verify it with the backend
      apiClient.get('/api/users/me')
        .then(response => {
          setCurrentUser(response.data);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('reactiquizToken');
          localStorage.removeItem('reactiquizUser');
          setCurrentUser(null);
        })
        .finally(() => {
          setIsLoadingAuth(false);
        });
    } else {
      setIsLoadingAuth(false); // No token, no session
    }
  }, []);

  const signIn = async (username, password) => {
    const response = await apiClient.post('/api/users/login', { username, password });
    const { token, user } = response.data;
    
    localStorage.setItem('reactiquizToken', token);
    localStorage.setItem('reactiquizUser', JSON.stringify(user));
    setCurrentUser(user);
    
    return response; // Return the full response for the page to use
  };
  
  const signUp = async (userData) => {
    return apiClient.post('/api/users/register', userData);
  };

  const signOut = useCallback(() => {
    localStorage.removeItem('reactiquizToken');
    localStorage.removeItem('reactiquizUser');
    setCurrentUser(null);
    // The axios interceptor will handle redirecting if needed, or we can do it here
    window.location.href = '/login';
  }, []);

  const value = {
    currentUser,
    isLoadingAuth,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};