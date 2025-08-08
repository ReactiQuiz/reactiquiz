// src/contexts/SubjectColorsContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useThemeContext } from './ThemeContext';

const SubjectColorsContext = createContext({
  colorMap: {},
  // The 'getColor' function will now accept the themeMode as an argument
  getColor: (subjectKey, themeMode) => '#0070F3', 
});

export const useSubjectColors = () => {
  // --- START OF THE DEFINITIVE FIX ---
  // The hook now gets the themeMode and provides it to the getColor function
  const { themeMode } = useThemeContext();
  const { colorMap, getColor: baseGetColor } = useContext(SubjectColorsContext);

  // This is the function components will actually call. It automatically
  // passes the current themeMode to the context's getColor function.
  const getColor = useCallback((subjectKey) => {
    return baseGetColor(subjectKey, themeMode);
  }, [baseGetColor, themeMode]);

  return { colorMap, getColor };
  // --- END OF THE DEFINITIVE FIX ---
};

export const SubjectColorsProvider = ({ children }) => {
  const [colorMap, setColorMap] = useState({});
  
  // This useEffect fetches the colors and is correct.
  useEffect(() => {
    const fetchAndStoreColors = async () => {
      try {
        const storedColors = localStorage.getItem('reactiquiz-subject-colors');
        if (storedColors) {
          setColorMap(JSON.parse(storedColors));
        } else {
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
        }
      } catch (error) {
        console.error("Failed to fetch or parse subject colors:", error);
      }
    };
    fetchAndStoreColors();
  }, []);

  // This function is now pure and does not use hooks.
  const getColor = useCallback((subjectKey, themeMode) => {
    const defaultColor = themeMode === 'dark' ? '#0070F3' : '#1976D2';
    if (!subjectKey || !colorMap[subjectKey]) return defaultColor;
    
    const subjectColors = colorMap[subjectKey];
    return subjectColors[themeMode] || defaultColor;
  }, [colorMap]);

  const value = { colorMap, getColor };

  return (
    <SubjectColorsContext.Provider value={value}>
      {children}
    </SubjectColorsContext.Provider>
  );
};