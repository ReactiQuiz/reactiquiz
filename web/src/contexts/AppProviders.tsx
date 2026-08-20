// src/contexts/AppProviders.tsx
/**
 * App Providers
 * 
 * This component composes all global context providers for the application.
 * It wraps the application with all necessary providers in the correct order,
 * ensuring all contexts are available throughout the component tree.
 */
import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { AppThemeProvider } from './ThemeContext';
import { SubjectColorsProvider } from './SubjectColorsContext';
import { TopicsProvider } from './TopicsContext';
import { NotificationsProvider } from './NotificationsContext';

/**
 * AppProvidersProps Interface
 * 
 * Props for the AppProviders component.
 */
interface AppProvidersProps {
  children: ReactNode; // Child components that will have access to all providers
}

/**
 * App Providers Component
 * 
 * Composes all global context providers in the correct dependency order:
 * 1. BrowserRouter - Provides routing functionality
 * 2. AuthProvider - Provides authentication state
 * 3. AppThemeProvider - Provides theme management (requires AuthProvider for theme persistence)
 * 4. NotificationsProvider - Provides notification queue
 * 5. SubjectColorsProvider - Provides subject accent colors (requires ThemeContext)
 * 6. TopicsProvider - Provides topics data cache
 * 
 * The nesting order ensures that inner providers have access to outer provider contexts.
 * 
 * @param {AppProvidersProps} props - Component props
 * @returns {JSX.Element} Wrapped application with all providers
 */
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
