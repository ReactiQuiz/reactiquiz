// --- CORRECTED CODE for src/index.js ---

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CssBaseline from '@mui/material/CssBaseline';
import { Analytics } from '@vercel/analytics/react'; // <-- ADD THIS LINE

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
    <Analytics /> {/* This will now work correctly */}
  </React.StrictMode>
);