// src/contexts/ThemeContext.js
import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme, lightTheme } from '../theme'; // Assuming your themes are exported from here

// Create the context
const ThemeContext = createContext({
  themeMode: 'dark',
  toggleTheme: () => {},
});

// Custom hook to use the context
export const useThemeContext = () => {
  return useContext(ThemeContext);
};

// The provider component that will wrap your app
export const AppThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('dark');

  // On initial load, check localStorage for a saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('reactiquiz-theme-mode');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeMode(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('reactiquiz-theme-mode', newMode);
      return newMode;
    });
  };

  // Select the theme object based on the current mode
  const theme = useMemo(() => (themeMode === 'light' ? lightTheme : darkTheme), [themeMode]);

  const value = { themeMode, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};