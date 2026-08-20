// src/contexts/AuthContext.tsx
/**
 * Authentication Context
 * 
 * This context provides authentication state and functions throughout the application.
 * It manages user authentication, login, logout, registration, and user data persistence
 * using localStorage for token and user object storage.
 */
import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import apiClient from '../api/axiosInstance';
import { User, UseAuthReturn, LoginResponse, RegisterRequest } from '../types';

/**
 * AuthContextType Interface
 * 
 * Extends UseAuthReturn interface to define the context type.
 * This ensures type safety when using the AuthContext.
 */
interface AuthContextType extends UseAuthReturn {}

/**
 * Auth Context
 * 
 * Creates the React context for authentication. Initially null until
 * the AuthProvider is mounted and provides the context value.
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * useAuth Hook
 * 
 * Custom hook to access the authentication context.
 * Must be used within an AuthProvider component tree.
 * 
 * @returns {UseAuthReturn} Authentication state and functions
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProviderProps Interface
 * 
 * Props for the AuthProvider component.
 */
interface AuthProviderProps {
  children: ReactNode; // Child components that will have access to auth context
}

/**
 * Auth Provider Component
 * 
 * Provides authentication context to the entire application.
 * Manages user authentication state, login, logout, registration,
 * and user data persistence using localStorage.
 * 
 * Features:
 * - Persistent authentication via localStorage
 * - Automatic token and user data loading on mount
 * - Login/logout functionality
 * - User registration
 * - User details updates
 * - Loading state management
 * 
 * @param {AuthProviderProps} props - Component props
 * @returns {JSX.Element} AuthProvider with context value
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  /**
   * Initialize Auth Effect
   * 
   * Runs once on initial app load to restore authentication state from localStorage.
   * Attempts to load stored user and token, and sets loading to false once complete.
   * Clears invalid data if parsing fails.
   */
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('reactiquizUser');
      const token = localStorage.getItem('reactiquizToken');

      if (storedUser && token) {
        try {
          const parsedUser: User = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          
          // Validate token and fetch fresh profile from backend
          const res = await apiClient.get<User>('/api/users/me');
          if (res.data) {
            setCurrentUser(res.data);
            localStorage.setItem('reactiquizUser', JSON.stringify(res.data));
          }
        } catch (error) {
          console.error("Failed to validate session or parse stored user data", error);
          localStorage.removeItem('reactiquizUser');
          localStorage.removeItem('reactiquizToken');
          setCurrentUser(null);
        }
      }
      setIsLoadingAuth(false);
    };

    initAuth();
  }, []);

  /**
   * Sign In
   * 
   * Authenticates a user with username and password.
   * On success, stores both token and user object in localStorage
   * and updates the current user state.
   * 
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<LoginResponse>} Login response with token and user data
   */
  const signIn = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/users/login', { username, password });
    const { token, user } = response.data;
    
    // On successful login, save BOTH token AND user object to localStorage.
    localStorage.setItem('reactiquizToken', token);
    localStorage.setItem('reactiquizUser', JSON.stringify(user));
    
    setCurrentUser(user);
    return response.data;
  };
  
  /**
   * Sign Out
   * 
   * Logs out the current user by:
   * 1. Removing token from localStorage
   * 2. Removing user object from localStorage
   * 3. Clearing current user state
   * 4. Redirecting to login page (full page reload to clear all state)
   */
  const signOut = useCallback((): void => {
    // On sign out, clear BOTH token AND user object.
    localStorage.removeItem('reactiquizToken');
    localStorage.removeItem('reactiquizUser');
    setCurrentUser(null);
    // Redirect to login to clear all component state.
    window.location.href = '/login';
  }, []);

  /**
   * Update Current User Details
   * 
   * Updates the current user's details in both state and localStorage.
   * Merges new details with existing user object.
   * 
   * @param {Partial<User>} newDetails - Partial user object with updated fields
   */
  const updateCurrentUserDetails = useCallback((newDetails: Partial<User>): void => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser: User = { ...prevUser, ...newDetails };
      // When updating details, also update the user object in localStorage.
      localStorage.setItem('reactiquizUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  /**
   * Sign Up
   * 
   * Registers a new user with the provided registration data.
   * 
   * @param {RegisterRequest} userData - User registration data
   * @returns {Promise<any>} Registration response from API
   */
  const signUp = async (userData: RegisterRequest): Promise<any> => {
    return apiClient.post('/api/users/register', userData);
  };

  const value: UseAuthReturn = {
    currentUser,
    isLoadingAuth,
    signIn,
    signUp,
    signOut,
    updateCurrentUserDetails,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
