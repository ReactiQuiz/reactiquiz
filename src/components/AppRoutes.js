// src/components/core/AppRoutes.js
import React, { Suspense } from 'react'; // <-- Import Suspense
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// --- START OF LAZY LOADING ---
// Create a simple, reusable loading component for Suspense
const SuspenseFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)' }}>
        <CircularProgress />
    </Box>
);

// Lazily import all your page components
const HomePage = React.lazy(() => import('../../pages/HomePage'));
const AllSubjectsPage = React.lazy(() => import('../../pages/AllSubjectsPage'));
const SubjectTopicsPage = React.lazy(() => import('../../pages/SubjectTopicsPage'));
const DashboardPage = React.lazy(() => import('../../pages/DashboardPage'));
const AccountPage = React.lazy(() => import('../../pages/AccountPage'));
const LoginPage = React.lazy(() => import('../../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../../pages/RegisterPage'));
const ResultsPage = React.lazy(() => import('../../pages/ResultsPage'));
const QuizPage = React.lazy(() => import('../../pages/QuizPage'));
const FriendsPage = React.lazy(() => import('../../pages/FriendsPage'));
const ChallengesPage = React.lazy(() => import('../../pages/ChallengesPage'));
const AICenterPage = React.lazy(() => import('../../pages/AICenterPage'));
const NotFoundPage = React.lazy(() => import('../../pages/NotFoundPage'));
// ... add any other pages you have
// --- END OF LAZY LOADING ---


function AppRoutes({ onOpenChangePasswordModal }) {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <SuspenseFallback />;
  }

  return (
    // Wrap your entire Routes component in a Suspense boundary
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* Your routes remain the same, but now they will be code-split */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/subjects" element={<AllSubjectsPage />} />
        <Route path="/subjects/:subjectKey" element={<SubjectTopicsPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountPage onOpenChangePasswordModal={onOpenChangePasswordModal} /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="/results/:resultId" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="/quiz/:topicId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>} />
        <Route path="/ai-center" element={<ProtectedRoute><AICenterPage /></ProtectedRoute>} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;