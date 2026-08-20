// src/App.tsx
/**
 * Main App component that serves as the root of the React application.
 * This component wraps the entire application with necessary providers and core components.
 */
import './index.css';
import React from 'react';
import { AppProviders } from './contexts/AppProviders';
import AppRoutes from './components/AppRoutes';
import NotificationManager from './components/core/NotificationManager';
import ScrollToTop from './components/core/ScrollToTop';

/**
 * App Component
 * 
 * This is the root component of the React application. It sets up the application structure
 * by wrapping everything with context providers and including essential utility components.
 * 
 * Structure:
 * - AppProviders: Provides all application-level contexts (theme, auth, notifications, etc.)
 * - ScrollToTop: Handles scrolling to top on route changes
 * - AppRoutes: Defines all application routes and navigation
 * - NotificationManager: Manages and displays application-wide notifications
 * 
 * @returns {JSX.Element} The root application component
 */
const App: React.FC = () => {
  return (
    <AppProviders>
      {/* ScrollToTop component ensures page scrolls to top when route changes */}
      <ScrollToTop />
      {/* AppRoutes component handles all application routing logic */}
      <AppRoutes />
      {/* NotificationManager component handles global notification display */}
      <NotificationManager />
    </AppProviders>
  );
};

export default App;
