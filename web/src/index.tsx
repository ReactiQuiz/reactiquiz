// src/index.tsx
/**
 * Application entry point that initializes the React application.
 * This file is responsible for mounting the root component and setting up global providers.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Analytics } from '@vercel/analytics/react';
import 'katex/dist/katex.min.css';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * QueryClient Configuration
 * 
 * Creates a React Query client instance with default options for data fetching:
 * - staleTime: Data is considered fresh for 5 minutes before refetching
 * - refetchOnWindowFocus: Disabled to prevent unnecessary refetches when user switches tabs
 * - retry: Failed requests will be retried up to 2 times before giving up
 * 
 * This configuration optimizes performance by reducing unnecessary network requests
 * while ensuring data stays relatively fresh.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for this duration
      refetchOnWindowFocus: false, // Don't refetch when user returns to the tab
      retry: 2, // Retry failed requests 2 times before showing error
    },
  },
});

/**
 * React DOM Root Initialization
 * 
 * Gets the root DOM element (typically a div with id="root" in index.html)
 * and creates a React root from it. This is the modern React 18 way of rendering.
 */
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

/**
 * Application Rendering
 * 
 * Renders the entire application with the following setup:
 * - React.StrictMode: Enables additional checks and warnings during development
 * - QueryClientProvider: Provides React Query client to all components for data fetching
 * - App: The main application component containing all routes and logic
 * - Analytics: Vercel Analytics for tracking page views and user behavior
 * - SpeedInsights: Vercel Speed Insights for monitoring performance metrics
 */
root.render(
  <React.StrictMode>
    {/* --- WRAP APP WITH THE PROVIDER --- */}
    <QueryClientProvider client={queryClient}>
      {/* Main application component */}
      <App />
      {/* Vercel Analytics - tracks page views and user interactions */}
      <Analytics />
      {/* Vercel Speed Insights - monitors web vitals and performance */}
      <SpeedInsights />
    </QueryClientProvider>
    {/* --- END OF WRAPPER --- */}
  </React.StrictMode>
);
