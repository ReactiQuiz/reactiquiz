// src/contexts/SubjectColorsContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useThemeContext } from './ThemeContext';

// --- START OF CHANGE: Define a version for the cache ---
const COLORS_CACHE_VERSION = 'v1';
const COLORS_CACHE_KEY = `reactiquiz-subject-colors-${COLORS_CACHE_VERSION}`;
// --- END OF CHANGE ---

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
                // --- START OF CHANGE: Use versioned key and clear old versions ---
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('reactiquiz-subject-colors-')) {
                        localStorage.removeItem(key);
                    }
                });
                localStorage.setItem(COLORS_CACHE_KEY, JSON.stringify(processedMap));
                // --- END OF CHANGE ---
            } catch (error) {
                console.error("Failed to fetch subject colors:", error);
            }
        };

        try {
            // --- START OF CHANGE: Use versioned key ---
            const storedColors = localStorage.getItem(COLORS_CACHE_KEY);
            // --- END OF CHANGE ---
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