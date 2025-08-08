// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CssBaseline from '@mui/material/CssBaseline';
import { Analytics } from '@vercel/analytics/react';
import 'katex/dist/katex.min.css';
import { SpeedInsights } from "@vercel/speed-insights/react";
// --- START OF TANSTACK QUERY SETUP ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Optional: disable refetching on window focus
      retry: 2, // Retry failed requests 2 times
    },
  },
});
// --- END OF TANSTACK QUERY SETUP ---

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* --- WRAP APP WITH THE PROVIDER --- */}
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <App />
      <Analytics />
      <SpeedInsights />
    </QueryClientProvider>
    {/* --- END OF WRAPPER --- */}
  </React.StrictMode>
);