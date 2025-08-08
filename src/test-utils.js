// src/test-utils.js

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from './contexts/ThemeContext'; // MUI needs a theme

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

/**
 * A minimal render function that provides only the most essential wrappers.
 * Tests that need more specific contexts (like AuthContext) will mock them directly.
 * This avoids complex dependency issues.
 */
export const renderWithProviders = (ui, options) => {
  const testQueryClient = createTestQueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <AppThemeProvider>
            {children}
        </AppThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper, ...options });
};

export * from '@testing-library/react';
export { renderWithProviders as render };