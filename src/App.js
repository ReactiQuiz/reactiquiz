// src/App.js
import { AppProviders } from './contexts/AppProviders';
import { CssBaseline } from '@mui/material';
import AppRoutes from './components/AppRoutes';
import NotificationManager from './components/core/NotificationManager';

function App() {
  return (
    <AppProviders>
      <CssBaseline />
      <AppRoutes />
      <NotificationManager />
    </AppProviders>
  );
}

export default App;