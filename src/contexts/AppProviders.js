// src/contexts/AppProviders.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { AppThemeProvider } from './ThemeContext';
import { SubjectColorsProvider } from './SubjectColorsContext'; // Correct source
import { TopicsProvider } from './TopicsContext';
import { NotificationsProvider } from './NotificationsContext';

export const AppProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppThemeProvider>
          <NotificationsProvider>
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