// src/contexts/SubjectColorsContext.tsx
/**
 * Subject Colors Context
 * 
 * This context provides subject-specific accent color management throughout the application.
 * It fetches subject colors from the API, caches them with versioning, and provides
 * theme-aware color retrieval based on current theme mode (dark/light).
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '../api/axiosInstance';
import { useThemeContext } from './ThemeContext';
import { UseSubjectColorsReturn, Subject } from '../types';

/**
 * Colors Cache Version
 * 
 * Version string for subject colors cache. Increment this when the cache structure
 * changes to force cache invalidation and fresh data fetch.
 */
const COLORS_CACHE_VERSION = 'v1';
const COLORS_CACHE_KEY = `reactiquiz-subject-colors-${COLORS_CACHE_VERSION}`;

/**
 * Subject Colors Context
 * 
 * Creates the React context for subject colors. Provides default values
 * for when context is used outside provider (fallback).
 */
const SubjectColorsContext = createContext<UseSubjectColorsReturn>({
  colorMap: {},
  getColor: () => '#0070F3',
});

/**
 * useSubjectColors Hook
 * 
 * Custom hook to access the subject colors context.
 * Provides color map and getColor function.
 * 
 * @returns {UseSubjectColorsReturn} Subject colors context value
 */
export const useSubjectColors = (): UseSubjectColorsReturn => {
  return useContext(SubjectColorsContext);
};

/**
 * SubjectColorsProviderProps Interface
 * 
 * Props for the SubjectColorsProvider component.
 */
interface SubjectColorsProviderProps {
  children: ReactNode; // Child components that will have access to subject colors
}

/**
 * Subject Colors Provider Component
 * 
 * Provides subject colors context to the application.
 * Fetches subject colors from API, caches in localStorage, and provides
 * theme-aware color retrieval based on current theme mode.
 * 
 * Features:
 * - Subject colors fetching from API
 * - Versioned localStorage caching
 * - Automatic cache cleanup for old versions
 * - Theme-aware color selection (dark/light)
 * - Default color fallback
 * 
 * @param {SubjectColorsProviderProps} props - Component props
 * @returns {JSX.Element} Subject colors provider with context value
 */
export const SubjectColorsProvider: React.FC<SubjectColorsProviderProps> = ({ children }) => {
  const [colorMap, setColorMap] = useState<Record<string, { dark: string; light: string }>>({});
  const { themeMode } = useThemeContext();

  /**
   * Fetch and Store Colors Effect
   * 
   * Loads subject colors on mount:
   * 1. First checks localStorage for cached colors (versioned)
   * 2. If cache exists and is valid, uses cached data
   * 3. If no cache, fetches from API and processes color map
   * 4. Cleans up old cache versions
   * 5. Has fallback API fetch on parsing errors
   */
  useEffect(() => {
    /**
     * Fetch And Store Colors
     * 
     * Fetches subjects from API and processes them into a color map.
     * Stores both dark and light theme colors for each subject.
     */
    const fetchAndStoreColors = async (): Promise<void> => {
      try {
        const { data } = await apiClient.get<Subject[]>('/api/subjects');
        const processedMap: Record<string, { dark: string; light: string }> = (data || []).reduce((acc, subject) => {
          acc[subject.subjectKey] = {
            dark: subject.accentColorDark,
            light: subject.accentColorLight,
          };
          return acc;
        }, {} as Record<string, { dark: string; light: string }>);
        
        setColorMap(processedMap);
        // Use versioned key and clear old versions
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('reactiquiz-subject-colors-')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem(COLORS_CACHE_KEY, JSON.stringify(processedMap));
      } catch (error) {
        console.error("Failed to fetch subject colors:", error);
      }
    };

    try {
      // Use versioned key
      const storedColors = localStorage.getItem(COLORS_CACHE_KEY);
      if (storedColors) {
        const parsedColors: Record<string, { dark: string; light: string }> = JSON.parse(storedColors);
        setColorMap(parsedColors);
      } else {
        fetchAndStoreColors();
      }
    } catch (e) {
      console.error("Failed to parse stored subject colors:", e);
      fetchAndStoreColors();
    }
  }, []);
  
  /**
   * Get Color
   * 
   * Retrieves the appropriate accent color for a subject based on current theme mode.
   * Returns dark theme color if theme is dark, light theme color if light/neon.
   * Falls back to default blue color if subject not found or invalid.
   * 
   * @param {string} subjectKey - Subject identifier key
   * @returns {string} Hex color code for the subject's accent color
   */
  const getColor = useCallback((subjectKey: string): string => {
    const defaultColor = themeMode === 'dark' ? '#0070F3' : '#1976D2'; // Default to a standard blue
    if (!subjectKey || !colorMap[subjectKey]) return defaultColor;
    
    const subjectColors = colorMap[subjectKey];
    return subjectColors[themeMode] || defaultColor;
  }, [colorMap, themeMode]);

  const value: UseSubjectColorsReturn = { colorMap, getColor };

  return (
    <SubjectColorsContext.Provider value={value}>
      {children}
    </SubjectColorsContext.Provider>
  );
};
