// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiClient from '../api/axiosInstance'; // For setting/clearing auth headers
import { useNavigate } from 'react-router-dom'; // For programmatic navigation on logout

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // To track initial auth check
  const navigate = useNavigate(); // For navigation after logout

  // Effect to load user from localStorage on initial app load
  useEffect(() => {
    // console.log("AuthProvider: Checking for saved user...");
    const savedUser = localStorage.getItem('reactiquizUser');
    const savedToken = localStorage.getItem('reactiquizToken');

    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        // console.log("AuthProvider: Found saved user", user);
        setCurrentUser({ ...user, token: savedToken });
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (e) {
        console.error("AuthProvider: Error parsing saved user from localStorage", e);
        localStorage.removeItem('reactiquizUser');
        localStorage.removeItem('reactiquizToken');
        delete apiClient.defaults.headers.common['Authorization'];
      }
    }
    setIsLoadingAuth(false); // Finished initial auth check
  }, []);

  const login = useCallback((userData, token) => {
    // console.log("AuthProvider: Logging in user", userData);
    const userToStore = { id: userData.id, name: userData.name, email: userData.email, address: userData.address, class: userData.class };
    localStorage.setItem('reactiquizUser', JSON.stringify(userToStore));
    localStorage.setItem('reactiquizToken', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setCurrentUser({ ...userToStore, token });
  }, []);

  const logout = useCallback(() => {
    // console.log("AuthProvider: Logging out user");
    setCurrentUser(null);
    localStorage.removeItem('reactiquizUser');
    localStorage.removeItem('reactiquizToken');
    delete apiClient.defaults.headers.common['Authorization'];
    navigate('/'); // Navigate to home page on logout
  }, [navigate]);

  // Function to update current user details (e.g., after profile update)
  const updateCurrentUserDetails = useCallback((updatedDetails) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const newUserData = { ...prevUser, ...updatedDetails };
      // Update localStorage as well
      const userToStore = { id: newUserData.id, name: newUserData.name, email: newUserData.email, address: newUserData.address, class: newUserData.class };
      localStorage.setItem('reactiquizUser', JSON.stringify(userToStore));
      return newUserData;
    });
  }, []);


  const value = {
    currentUser,
    isLoadingAuth, // Provide loading state for initial auth check
    login,
    logout,
    setCurrentUserDirectly: setCurrentUser, // Expose direct setCurrentUser if needed, but prefer login/logout
    updateCurrentUserDetails, // For profile updates
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};