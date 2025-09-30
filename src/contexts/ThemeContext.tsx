// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useMemo, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider, Theme } from '@mui/material/styles';
import { darkTheme, lightTheme } from '../theme';
import { ThemeMode } from '../types';

interface ThemeContextType extends ThemeMode {}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  toggleTheme: () => {},
});

// Custom hook to use the context
export const useThemeContext = (): ThemeContextType => {
  return useContext(ThemeContext);
};

interface AppThemeProviderProps {
  children: ReactNode;
}

// The provider component that will wrap your app
export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

  // On initial load, check localStorage for a saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('reactiquiz-theme-mode');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeMode(savedTheme);
    }
  }, []);

  const toggleTheme = (): void => {
    setThemeMode((prevMode) => {
      const newMode: 'light' | 'dark' = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('reactiquiz-theme-mode', newMode);
      return newMode;
    });
  };

  // Select the theme object based on the current mode
  const theme: Theme = useMemo(() => (themeMode === 'light' ? lightTheme : darkTheme), [themeMode]);

  const value: ThemeContextType = { themeMode, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
