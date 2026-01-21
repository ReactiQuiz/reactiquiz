// src/components/core/AppProviders.tsx
/**
 * App Providers Component
 * 
 * This component composes all the global context providers for the application.
 * It provides a clean way to manage multiple providers without "Provider Hell".
 * 
 * Provider hierarchy (outermost to innermost):
 * 1. BrowserRouter - Enables routing functionality
 * 2. AuthProvider - Manages authentication state
 * 3. AppThemeProvider - Manages theme (light/dark/neon)
 * 4. NotificationsProvider - Manages global notifications
 * 5. SubjectColorsProvider - Manages subject-specific colors
 * 6. TopicsProvider - Manages topics data
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { AppThemeProvider } from '../../contexts/ThemeContext';
import { SubjectColorsProvider } from '../../contexts/SubjectColorsContext';
import { TopicsProvider } from '../../contexts/TopicsContext';
import { NotificationsProvider } from '../../contexts/NotificationsContext';

/**
 * App Providers Component
 * 
 * Wraps the entire application with all necessary context providers.
 * The order of providers is important as inner providers can use
 * context from outer providers.
 * 
 * @param {React.ReactNode} children - The child components to wrap with providers
 * @returns {JSX.Element} Application wrapped with all context providers
 */
export const AppProviders = ({ children }) => {
  return (
    <BrowserRouter>
      {/* Authentication provider - manages user login state */}
      <AuthProvider>
        {/* Theme provider - manages application theme (light/dark/neon) */}
        <AppThemeProvider>
          {/* Notifications provider - manages global notification queue */}
          <NotificationsProvider>
            {/* Subject colors provider - manages subject-specific color schemes */}
            <SubjectColorsProvider>
              {/* Topics provider - manages topics data and fetching */}
              <TopicsProvider>
                {children}
              </TopicsProvider>
            </SubjectColorsProvider>
          </NotificationsProvider>
        </AppThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};