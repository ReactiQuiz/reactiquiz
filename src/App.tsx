// src/App.tsx
import './index.css';
import React from 'react';
import { AppProviders } from './contexts/AppProviders';
import AppRoutes from './components/AppRoutes';
import NotificationManager from './components/core/NotificationManager';
import ScrollToTop from './components/core/ScrollToTop';

const App: React.FC = () => {
  return (
    <AppProviders>
      <ScrollToTop />
      <AppRoutes />
      <NotificationManager />
    </AppProviders>
  );
};

export default App;
