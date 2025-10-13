// src/contexts/SubjectColorsContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '../api/axiosInstance';
import { useThemeContext } from './ThemeContext';
import { UseSubjectColorsReturn, Subject } from '../types';

// Define a version for the cache
const COLORS_CACHE_VERSION = 'v1';
const COLORS_CACHE_KEY = `reactiquiz-subject-colors-${COLORS_CACHE_VERSION}`;

const SubjectColorsContext = createContext<UseSubjectColorsReturn>({
  colorMap: {},
  getColor: () => '#0070F3',
});

export const useSubjectColors = (): UseSubjectColorsReturn => {
  return useContext(SubjectColorsContext);
};

interface SubjectColorsProviderProps {
  children: ReactNode;
}

export const SubjectColorsProvider: React.FC<SubjectColorsProviderProps> = ({ children }) => {
  const [colorMap, setColorMap] = useState<Record<string, { dark: string; light: string }>>({});
  const { themeMode } = useThemeContext();

  useEffect(() => {
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
