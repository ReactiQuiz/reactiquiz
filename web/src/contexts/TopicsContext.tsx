// src/contexts/TopicsContext.tsx
/**
 * Topics Context
 * 
 * This context provides global topics data management. It fetches all topics
 * from the API on mount, caches them in localStorage with versioning, and
 * provides topics data throughout the application.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/axiosInstance';
import { UseTopicsReturn, Topic } from '../types';

/**
 * Topics Cache Version
 * 
 * Version string for topics cache. Increment this when the cache structure
 * changes to force cache invalidation and fresh data fetch.
 */
const TOPICS_CACHE_VERSION = 'v1';
const TOPICS_CACHE_KEY = `reactiquiz-topics-${TOPICS_CACHE_VERSION}`;

/**
 * Topics Context
 * 
 * Creates the React context for topics. Provides default values
 * for when context is used outside provider (fallback).
 */
const TopicsContext = createContext<UseTopicsReturn>({
  topics: [],
  isLoading: true,
});

/**
 * useTopics Hook
 * 
 * Custom hook to access the topics context.
 * Provides topics array and loading state.
 * 
 * @returns {UseTopicsReturn} Topics context value
 */
export const useTopics = (): UseTopicsReturn => {
  return useContext(TopicsContext);
};

/**
 * TopicsProviderProps Interface
 * 
 * Props for the TopicsProvider component.
 */
interface TopicsProviderProps {
  children: ReactNode; // Child components that will have access to topics
}

/**
 * Topics Provider Component
 * 
 * Provides topics context to the application.
 * Fetches topics from API on mount, caches in localStorage, and manages loading state.
 * 
 * Features:
 * - Topics data fetching from API
 * - Versioned localStorage caching
 * - Automatic cache cleanup for old versions
 * - Loading state management
 * - Error handling with fallback API fetch
 * 
 * @param {TopicsProviderProps} props - Component props
 * @returns {JSX.Element} Topics provider with context value
 */
export const TopicsProvider: React.FC<TopicsProviderProps> = ({ children }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Load Topics Effect
   * 
   * Fetches topics data on mount:
   * 1. First checks localStorage for cached topics (versioned)
   * 2. If cache exists and is valid, uses cached data
   * 3. If no cache, fetches from API and caches result
   * 4. Cleans up old cache versions
   * 5. Has fallback API fetch on any error
   * 
   * Runs only once when the component mounts (app starts).
   */
  useEffect(() => {
    /**
     * Load Topics
     * 
     * Asynchronous function to load topics from cache or API.
     * Handles caching, versioning, and error recovery.
     */
    const loadTopics = async (): Promise<void> => {
      setIsLoading(true);
      try {
        // Clear any cached topics from localStorage to ensure stale topics are purged
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('reactiquiz-topics')) {
            localStorage.removeItem(key);
          }
        });

        // Always fetch fresh topics directly from API
        const { data } = await apiClient.get<Topic[]>('/api/topics');
        if (data && Array.isArray(data)) {
          setTopics(data);
          localStorage.setItem(TOPICS_CACHE_KEY, JSON.stringify(data));
        }
      } catch (error) {
        console.error("Failed to load or parse topics:", error);
        // If anything fails, try one last fetch from the API as a fallback
        try {
          const { data } = await apiClient.get<Topic[]>('/api/topics');
          setTopics(data || []);
        } catch (fetchError) {
          console.error("Final attempt to fetch topics failed:", fetchError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTopics();
  }, []); // This effect runs only once when the app starts

  const value: UseTopicsReturn = { topics, isLoading };

  return (
    <TopicsContext.Provider value={value}>
      {children}
    </TopicsContext.Provider>
  );
};
