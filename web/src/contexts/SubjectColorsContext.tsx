// src/contexts/SubjectColorsContext.tsx
/**
 * Subject Colors Context
 * 
 * This context provides subject-specific and topic-specific accent color management throughout
 * the application. It fetches subject colors directly from the database API, caches them,
 * and provides theme-aware color retrieval based on the current theme mode (dark/light).
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '../api/axiosInstance';
import { useThemeContext } from './ThemeContext';
import { UseSubjectColorsReturn, Subject } from '../types';
import { organicLight, organicDark } from '../themeTokens';

/**
 * Colors Cache Version
 * 
 * Version string for subject colors cache. Increment this when the cache structure
 * changes to force cache invalidation and fresh data fetch.
 */
const COLORS_CACHE_VERSION = 'v2';
const COLORS_CACHE_KEY = `reactiquiz-subject-colors-${COLORS_CACHE_VERSION}`;

/**
 * Subject Colors Context
 * 
 * Creates the React context for subject colors. Provides default values
 * for when context is used outside provider (fallback).
 */
const SubjectColorsContext = createContext<UseSubjectColorsReturn>({
  colorMap: {},
  getColor: () => organicLight.accentBase,
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
  children: ReactNode;
}

/**
 * Subject Colors Provider Component
 * 
 * Provides subject colors context to the application.
 * Fetches subject colors directly from the database via API,
 * maps them by subjectKey, id, and name, and provides theme-aware
 * color retrieval matching the database schema (accentColorDark / accentColorLight).
 * 
 * @param {SubjectColorsProviderProps} props - Component props
 * @returns {JSX.Element} Subject colors provider with context value
 */
export const SubjectColorsProvider: React.FC<SubjectColorsProviderProps> = ({ children }) => {
  const [colorMap, setColorMap] = useState<Record<string, { dark: string; light: string }>>({});
  const { themeMode } = useThemeContext();

  /**
   * Process raw subjects from DB into a unified color map indexed by
   * subjectKey, subject ID, and subject name.
   */
  const processSubjectColorMap = (subjects: Subject[]): Record<string, { dark: string; light: string }> => {
    const map: Record<string, { dark: string; light: string }> = {};

    (subjects || []).forEach(subject => {
      const dark = subject.accentColorDark || subject.accentColorLight || organicDark.accentBase;
      const light = subject.accentColorLight || subject.accentColorDark || organicLight.accentBase;
      const entry = { dark, light };

      if (subject.subjectKey) {
        map[subject.subjectKey] = entry;
        map[subject.subjectKey.toLowerCase()] = entry;
      }
      if (subject.id) {
        map[subject.id] = entry;
        map[subject.id.toLowerCase()] = entry;
      }
      if (subject.name) {
        map[subject.name] = entry;
        map[subject.name.toLowerCase()] = entry;
      }
    });

    return map;
  };

  /**
   * Fetch and Store Colors Effect
   * 
   * Fetches subjects directly from the database API and syncs with state & cache.
   */
  useEffect(() => {
    const fetchAndStoreColors = async (): Promise<void> => {
      try {
        const { data } = await apiClient.get<Subject[]>('/api/subjects');
        if (data && Array.isArray(data)) {
          const processedMap = processSubjectColorMap(data);
          setColorMap(processedMap);

          // Clear legacy cache keys and store fresh DB colors
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('reactiquiz-subject-colors')) {
              localStorage.removeItem(key);
            }
          });
          localStorage.setItem(COLORS_CACHE_KEY, JSON.stringify(processedMap));
        }
      } catch (error) {
        console.error("Failed to fetch subject colors from database:", error);
      }
    };

    try {
      const storedColors = localStorage.getItem(COLORS_CACHE_KEY);
      if (storedColors) {
        const parsedColors: Record<string, { dark: string; light: string }> = JSON.parse(storedColors);
        setColorMap(parsedColors);
      }
    } catch (e) {
      console.error("Failed to parse stored subject colors:", e);
    }

    // Always fetch fresh colors from DB on startup
    fetchAndStoreColors();
  }, []);
  
  /**
   * Get Color
   * 
   * Retrieves the appropriate accent color directly from the database records
   * based on subjectKey, subject ID, or topic subject reference.
   * 
   * @param {string} subjectIdentifier - Subject key, subject ID, or topic's subject reference
   * @returns {string} Hex color code for the subject/topic accent color inherited from DB
   */
  const getColor = useCallback((subjectIdentifier: string): string => {
    const defaultColor = themeMode === 'dark' ? organicDark.accentBase : organicLight.accentBase;
    if (!subjectIdentifier) return defaultColor;

    const trimmed = String(subjectIdentifier).trim();
    const subjectColors = colorMap[trimmed] || colorMap[trimmed.toLowerCase()];
    if (subjectColors) {
      const modeColor = themeMode === 'dark' ? subjectColors.dark : subjectColors.light;
      return modeColor || subjectColors.dark || subjectColors.light || defaultColor;
    }

    return defaultColor;
  }, [colorMap, themeMode]);

  const value: UseSubjectColorsReturn = { colorMap, getColor };

  return (
    <SubjectColorsContext.Provider value={value}>
      {children}
    </SubjectColorsContext.Provider>
  );
};
