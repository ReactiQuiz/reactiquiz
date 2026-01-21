// src/contexts/ThemeContext.tsx
/**
 * Theme Context
 * 
 * This context provides theme management functionality throughout the application.
 * It manages theme mode (light, dark, neon) and persists user preference in localStorage.
 * Wraps the application with Material-UI ThemeProvider for theme access.
 */
import React, { createContext, useState, useMemo, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider, Theme } from '@mui/material/styles';
import { darkTheme, lightTheme, neonTheme } from '../theme';

/**
 * Theme Type
 * 
 * Available theme modes for the application.
 */
export type ThemeType = 'light' | 'dark' | 'neon';

/**
 * ThemeContextType Interface
 * 
 * Defines the shape of the theme context value.
 */
interface ThemeContextType {
  themeMode: ThemeType; // Current theme mode
  setTheme: (theme: ThemeType) => void; // Function to change theme mode
}

/**
 * Theme Context
 * 
 * Creates the React context for theme management. Provides default values
 * for when context is used outside provider (fallback).
 */
const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  setTheme: () => {},
});

/**
 * useThemeContext Hook
 * 
 * Custom hook to access the theme context.
 * Provides theme mode and setTheme function.
 * 
 * @returns {ThemeContextType} Theme context value
 */
export const useThemeContext = (): ThemeContextType => {
  return useContext(ThemeContext);
};

/**
 * AppThemeProviderProps Interface
 * 
 * Props for the AppThemeProvider component.
 */
interface AppThemeProviderProps {
  children: ReactNode; // Child components that will have access to theme
}

/**
 * App Theme Provider Component
 * 
 * Provides theme context and Material-UI ThemeProvider to the application.
 * Manages theme mode state, persistence in localStorage, and theme selection.
 * 
 * Features:
 * - Theme mode state management (light, dark, neon)
 * - Persistent theme preference in localStorage
 * - Automatic theme restoration on app load
 * - Material-UI theme provider integration
 * 
 * @param {AppThemeProviderProps} props - Component props
 * @returns {JSX.Element} Theme provider with context and MUI ThemeProvider
 */
export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeType>('dark');

  /**
   * Initialize Theme Effect
   * 
   * Runs once on mount to restore saved theme preference from localStorage.
   * Validates that the saved theme is a valid ThemeType before applying.
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('reactiquiz-theme-mode');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'neon')) {
      setThemeMode(savedTheme as ThemeType);
    }
  }, []);

  /**
   * Set Theme
   * 
   * Updates the theme mode and persists the preference in localStorage.
   * 
   * @param {ThemeType} theme - The theme mode to set (light, dark, or neon)
   */
  const setTheme = (theme: ThemeType): void => {
    setThemeMode(theme);
    localStorage.setItem('reactiquiz-theme-mode', theme);
  };

  /**
   * Theme Object
   * 
   * Memoized Material-UI theme object based on current theme mode.
   * Returns the appropriate theme configuration (dark, light, or neon).
   */
  const theme: Theme = useMemo(() => {
    switch(themeMode) {
      case 'light':
        return lightTheme;
      case 'neon':
        return neonTheme;
      case 'dark':
      default:
        return darkTheme;
    }
  }, [themeMode]);

  const value: ThemeContextType = { themeMode, setTheme };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
