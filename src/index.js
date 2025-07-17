// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CssBaseline from '@mui/material/CssBaseline';
import { Analytics } from '@vercel/analytics/react';
import 'katex/dist/katex.min.css'; // <-- ADD THIS LINE

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App /> {/* App already contains Router */}
    <Analytics />
  </React.StrictMode>
);