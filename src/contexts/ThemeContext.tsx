// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useMemo, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider, Theme } from '@mui/material/styles';
import { darkTheme, lightTheme, neonTheme } from '../theme';

export type ThemeType = 'light' | 'dark' | 'neon';

interface ThemeContextType {
  themeMode: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  setTheme: () => {},
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
  const [themeMode, setThemeMode] = useState<ThemeType>('dark');

  // On initial load, check localStorage for a saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('reactiquiz-theme-mode');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'neon')) {
      setThemeMode(savedTheme as ThemeType);
    }
  }, []);

  const setTheme = (theme: ThemeType): void => {
    setThemeMode(theme);
    localStorage.setItem('reactiquiz-theme-mode', theme);
  };

  // Select the theme object based on the current mode
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
