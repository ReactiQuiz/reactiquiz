// src/contexts/AppProviders.tsx
import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { AppThemeProvider } from './ThemeContext';
import { SubjectColorsProvider } from './SubjectColorsContext';
import { TopicsProvider } from './TopicsContext';
import { NotificationsProvider } from './NotificationsContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
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
