// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import apiClient from '../api/axiosInstance';
import { User, UseAuthReturn, LoginResponse, RegisterRequest } from '../types';

interface AuthContextType extends UseAuthReturn {}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // This useEffect runs only ONCE on initial app load.
  useEffect(() => {
    try {
      // Try to get the user object and token from localStorage.
      const storedUser = localStorage.getItem('reactiquizUser');
      const token = localStorage.getItem('reactiquizToken');

      if (storedUser && token) {
        // If they exist, parse the user and set it as the current user synchronously.
        const parsedUser: User = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      }
    } catch (error) {
      // If parsing fails, clear storage to be safe.
      console.error("Failed to parse stored user data", error);
      localStorage.removeItem('reactiquizUser');
      localStorage.removeItem('reactiquizToken');
    } finally {
      // Signal that authentication loading is complete.
      // This happens almost instantly, preventing crashes.
      setIsLoadingAuth(false);
    }
  }, []);

  const signIn = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/users/login', { username, password });
    const { token, user } = response.data;
    
    // On successful login, save BOTH token AND user object to localStorage.
    localStorage.setItem('reactiquizToken', token);
    localStorage.setItem('reactiquizUser', JSON.stringify(user));
    
    setCurrentUser(user);
    return response.data;
  };
  
  const signOut = useCallback((): void => {
    // On sign out, clear BOTH token AND user object.
    localStorage.removeItem('reactiquizToken');
    localStorage.removeItem('reactiquizUser');
    setCurrentUser(null);
    // Redirect to login to clear all component state.
    window.location.href = '/login';
  }, []);

  const updateCurrentUserDetails = useCallback((newDetails: Partial<User>): void => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser: User = { ...prevUser, ...newDetails };
      // When updating details, also update the user object in localStorage.
      localStorage.setItem('reactiquizUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

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
