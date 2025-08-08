// src/contexts/__mocks__/ThemeContext.js

import React, { createContext, useContext } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a real, but simple, dark theme to be used in all tests
const testTheme = createTheme({ palette: { mode: 'dark' } });

// Create a mock context with default, non-changing values
const MockThemeContext = createContext({
  themeMode: 'dark',
  toggleTheme: () => {},
});

// Mock the useThemeContext hook so other components can call it without error
export const useThemeContext = () => {
  return useContext(MockThemeContext);
};

// Mock the AppThemeProvider. It will now use our simple test theme.
export const AppThemeProvider = ({ children }) => {
  const value = {
    themeMode: 'dark',
    toggleTheme: () => {},
  };
  return (
    <MockThemeContext.Provider value={value}>
      <ThemeProvider theme={testTheme}>{children}</ThemeProvider>
    </MockThemeContext.Provider>
  );
};