// src/contexts/ThemeContext.tsx
/**
 * Theme Context
 *
 * Manages theme mode (light, dark) and persists user preference in
 * localStorage. Wraps the application with Material-UI ThemeProvider.
 */
import React, { createContext, useState, useMemo, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { organicLightTheme, organicDarkTheme } from '../theme';

export type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  setTheme: () => {},
});

export const useThemeContext = (): ThemeContextType => {
  return useContext(ThemeContext);
};

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeType>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('reactiquiz-theme-mode');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeMode(savedTheme);
    } else if (savedTheme === 'neon') {
      // The neon theme was removed with the Organic retheme — migrate
      // existing users to dark rather than leaving them on a dead mode.
      setThemeMode('dark');
      localStorage.setItem('reactiquiz-theme-mode', 'dark');
    }
  }, []);

  const setTheme = (theme: ThemeType): void => {
    setThemeMode(theme);
    localStorage.setItem('reactiquiz-theme-mode', theme);
  };

  const theme: Theme = useMemo(() => {
    return themeMode === 'light' ? organicLightTheme : organicDarkTheme;
  }, [themeMode]);

  const value: ThemeContextType = { themeMode, setTheme };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
