// src/components/core/AppRoutes.js
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './core/ProtectedRoute';

// A simple, reusable loading component for lazy-loaded pages
const SuspenseFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)' }}>
    <CircularProgress />
  </Box>
);

// Lazily import all your page components for better performance
const HomePage = React.lazy(() => import('../pages/HomePage'));
const AllSubjectsPage = React.lazy(() => import('../pages/AllSubjectsPage'));
const SubjectTopicsPage = React.lazy(() => import('../pages/SubjectTopicsPage'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const AccountPage = React.lazy(() => import('../pages/AccountPage'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const ResultsPage = React.lazy(() => import('../pages/ResultsPage'));
const QuizPage = React.lazy(() => import('../pages/QuizPage'));
const FriendsPage = React.lazy(() => import('../pages/FriendsPage'));
const ChallengesPage = React.lazy(() => import('../pages/ChallengesPage'));
const AICenterPage = React.lazy(() => import('../pages/AICenterPage'));
const HomibhabhaPage = React.lazy(() => import('../pages/HomibhabhaPage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));
const QuizLoadingPage = React.lazy(() => import('../../pages/QuizLoadingPage'));

function AppRoutes({ onOpenChangePasswordModal }) {
  const { currentUser, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <SuspenseFallback />;
  }

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* --- START OF ROUTING FIXES --- */}

        {/* 1. Homepage Logic: Redirect logged-in users to dashboard */}
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <HomePage />} />

        {/* 2. Public Routes that everyone can see */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/homibhabha" element={<HomibhabhaPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* 3. Protected Routes: Only accessible to logged-in users */}
        <Route path="/subjects" element={<ProtectedRoute><AllSubjectsPage /></ProtectedRoute>} />
        <Route path="/subjects/:subjectKey" element={<ProtectedRoute><SubjectTopicsPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountPage onOpenChangePasswordModal={onOpenChangePasswordModal} /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="/results/:resultId" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        {/* The Quiz Loading route */}
        <Route path="/quiz/loading" element={<ProtectedRoute><QuizLoadingPage /></ProtectedRoute>} />
        {/* The actual quiz page route */}
        <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>} />
        <Route path="/ai-center" element={<ProtectedRoute><AICenterPage /></ProtectedRoute>} />

        {/* --- END OF ROUTING FIXES --- */}

        {/* Fallback Route for any other path */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;