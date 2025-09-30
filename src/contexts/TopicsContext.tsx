// src/contexts/TopicsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/axiosInstance';
import { UseTopicsReturn, Topic } from '../types';

const TOPICS_CACHE_VERSION = 'v1';
const TOPICS_CACHE_KEY = `reactiquiz-topics-${TOPICS_CACHE_VERSION}`;

const TopicsContext = createContext<UseTopicsReturn>({
  topics: [],
  isLoading: true,
});

export const useTopics = (): UseTopicsReturn => {
  return useContext(TopicsContext);
};

interface TopicsProviderProps {
  children: ReactNode;
}

export const TopicsProvider: React.FC<TopicsProviderProps> = ({ children }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTopics = async (): Promise<void> => {
      setIsLoading(true);
      try {
        // Use the versioned key
        const storedTopics = localStorage.getItem(TOPICS_CACHE_KEY);
        if (storedTopics) {
          const parsedTopics: Topic[] = JSON.parse(storedTopics);
          setTopics(parsedTopics);
        } else {
          const { data } = await apiClient.get<Topic[]>('/api/topics');
          if (data && Array.isArray(data)) {
            setTopics(data);
            // Use the versioned key and clear old versions
            // Clear any old, unversioned or differently versioned keys
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('reactiquiz-topics-')) {
                localStorage.removeItem(key);
              }
            });
            localStorage.setItem(TOPICS_CACHE_KEY, JSON.stringify(data));
          }
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
