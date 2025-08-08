// src/contexts/AppProviders.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { AppThemeProvider } from './ThemeContext';
import { SubjectColorsProvider } from './SubjectColorsContext';
import { TopicsProvider } from './TopicsContext';
import { NotificationsProvider } from './NotificationsContext'; // Import our new provider

/**
 * This component composes all the global context providers for the application.
 * It's a clean way to manage "Provider Hell".
 */
export const AppProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppThemeProvider>
          <NotificationsProvider> {/* <-- Add the new provider here */}
            <SubjectColorsProvider>
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