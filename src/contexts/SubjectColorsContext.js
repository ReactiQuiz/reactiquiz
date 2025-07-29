// src/contexts/SubjectColorsContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useThemeContext } from './ThemeContext';

const SubjectColorsContext = createContext({});

export const useSubjectColors = () => {
  return useContext(SubjectColorsContext);
};

export const SubjectColorsProvider = ({ children }) => {
  const [colorMap, setColorMap] = useState({});
  const { themeMode } = useThemeContext();

  useEffect(() => {
    const fetchAndStoreColors = async () => {
      try {
        const { data } = await apiClient.get('/api/subjects');
        const processedMap = (data || []).reduce((acc, subject) => {
          acc[subject.subjectKey] = {
            dark: subject.accentColorDark,
            light: subject.accentColorLight,
          };
          return acc;
        }, {});
        
        setColorMap(processedMap);
        localStorage.setItem('reactiquiz-subject-colors', JSON.stringify(processedMap));
      } catch (error) {
        console.error("Failed to fetch subject colors:", error);
      }
    };

    try {
      const storedColors = localStorage.getItem('reactiquiz-subject-colors');
      if (storedColors) {
        setColorMap(JSON.parse(storedColors));
      } else {
        fetchAndStoreColors();
      }
    } catch (e) {
      console.error("Failed to parse stored subject colors:", e);
      fetchAndStoreColors();
    }
  }, []);

  const getColor = useCallback((subjectKey) => {
    const defaultColor = themeMode === 'dark' ? '#0070F3' : '#1976D2'; // Default to a standard blue
    if (!subjectKey || !colorMap[subjectKey]) return defaultColor;
    
    const subjectColors = colorMap[subjectKey];
    return subjectColors[themeMode] || defaultColor;
  }, [colorMap, themeMode]);

  const value = { colorMap, getColor };

  return (
    <SubjectColorsContext.Provider value={value}>
      {children}
    </SubjectColorsContext.Provider>
  );
};