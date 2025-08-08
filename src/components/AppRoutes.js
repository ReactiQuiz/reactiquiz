// src/components/core/AppRoutes.js
import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './core/ProtectedRoute';  
import MainLayout from '../layout/MainLayout';
import MinimalLayout from '../layout/MinimalLayout';

const SuspenseFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)' }}>
        <CircularProgress />
    </Box>
);

const HomePage = React.lazy(() => import('../../pages/HomePage'));
const AllSubjectsPage = React.lazy(() => import('../../pages/AllSubjectsPage'));
const SubjectTopicsPage = React.lazy(() => import('../../pages/SubjectTopicsPage'));
const DashboardPage = React.lazy(() => import('../../pages/DashboardPage'));
const AccountPage = React.lazy(() => import('../../pages/AccountPage'));
const LoginPage = React.lazy(() => import('../../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../../pages/RegisterPage'));
const ResultsPage = React.lazy(() => import('../../pages/ResultsPage'));
const QuizPage = React.lazy(() => import('../../pages/QuizPage'));
const AICenterPage = React.lazy(() => import('../../pages/AICenterPage'));
const HomibhabhaPage = React.lazy(() => import('../../pages/HomibhabhaPage'));
const AboutPage = React.lazy(() => import('../../pages/AboutPage'));
const NotFoundPage = React.lazy(() => import('../../pages/NotFoundPage'));
const QuizLoadingPage = React.lazy(() => import('../../pages/QuizLoadingPage'));
const SettingsPage = React.lazy(() => import('../../pages/SettingsPage'));
const FlashcardPage = React.lazy(() => import('../../pages/FlashcardPage'));

// A helper to pass the outlet context down to pages that need it
const AccountPageWithContext = () => {
    const context = useOutletContext();
    return <AccountPage onOpenChangePasswordModal={context.onOpenChangePasswordModal} />;
};

function AppRoutes() {
  const { currentUser, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <SuspenseFallback />;
  }

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route element={<MainLayout />}>
            <Route path="/subjects" element={<ProtectedRoute><AllSubjectsPage /></ProtectedRoute>} />
            <Route path="/subjects/:subjectKey" element={<ProtectedRoute><SubjectTopicsPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountPageWithContext /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route path="/results/:resultId" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route path="/ai-center" element={<ProtectedRoute><AICenterPage /></ProtectedRoute>} />
            <Route path="/quiz/loading" element={<ProtectedRoute><QuizLoadingPage /></ProtectedRoute>} />
            <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/flashcards/:topicId" element={<ProtectedRoute><FlashcardPage /></ProtectedRoute>} />
            <Route path="/homibhabha" element={<ProtectedRoute><HomibhabhaPage /></ProtectedRoute>} />
            <Route path="/about" element={currentUser ? <AboutPage /> : <Navigate to="/about-guest" />} />
        </Route>
        
        <Route element={<MinimalLayout />}>
            <Route path="/about-guest" element={<AboutPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;