// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Or your global styles
import App from './App';
// Optional: For baseline MUI styling (highly recommended)
import CssBaseline from '@mui/material/CssBaseline';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CssBaseline /> {/* Adds MUI's baseline styling */}
    <App />
  </React.StrictMode>
);