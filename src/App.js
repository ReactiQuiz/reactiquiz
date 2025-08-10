// src/App.js
import { AppProviders } from './contexts/AppProviders';
import { CssBaseline } from '@mui/material';
import AppRoutes from './components/AppRoutes';
import NotificationManager from './components/core/NotificationManager';
import ScrollToTop from './components/core/ScrollToTop';

function App() {
  return (
    <AppProviders>
      <CssBaseline />
      <ScrollToTop />
      <AppRoutes />
      <NotificationManager />
    </AppProviders>
  );
}

export default App;