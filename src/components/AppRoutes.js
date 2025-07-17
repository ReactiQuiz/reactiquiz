// src/components/core/AppRoutes.js
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import React, { Suspense } from 'react'; // <-- Import Suspense
import ProtectedRoute from './core/ProtectedRoute'; // Corrected path assuming it's in the same folder

// --- START OF CODE SPLITTING ---
const HomePage = React.lazy(() => import('../pages/HomePage'));
const AllSubjectsPage = React.lazy(() => import('../pages/AllSubjectsPage'));
const SubjectTopicsPage = React.lazy(() => import('../pages/SubjectTopicsPage'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const HomibhabhaPage = React.lazy(() => import('../pages/HomibhabhaPage'));
const QuizPage = React.lazy(() => import('../pages/QuizPage'));
const ResultsPage = React.lazy(() => import('../pages/ResultsPage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage'));
const AccountPage = React.lazy(() => import('../pages/AccountPage'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const FlashcardPage = React.lazy(() => import('../pages/FlashcardPage'));
const FriendsPage = React.lazy(() => import('../pages/FriendsPage'));
const ChallengesPage = React.lazy(() => import('../pages/ChallengesPage'));
const AICenterPage = React.lazy(() => import('../pages/AICenterPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));


// A fallback component for Suspense
const SuspenseFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)' }}>
        <CircularProgress />
    </Box>
);
// --- END OF CODE SPLITTING ---

function AppRoutes({ onOpenChangePasswordModal }) {
  const { currentUser, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <SuspenseFallback />; // Use the same fallback for initial auth load
  }

  return (
    <Suspense fallback={<SuspenseFallback />}> {/* Wrap Routes in Suspense */}
      <Routes>
        {/* All routes remain the same, but now they will be lazy-loaded */}
        <Route path="/" element={currentUser ? <Navigate to="/subjects" replace /> : <HomePage />} />
        <Route path="/login" element={currentUser ? <Navigate to="/subjects" replace /> : <LoginPage />} />
        <Route path="/register" element={currentUser ? <Navigate to="/subjects" replace /> : <RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/subjects" element={<AllSubjectsPage />} />
        <Route path="/subjects/:subjectKey" element={<SubjectTopicsPage />} />
        <Route path="/flashcards/:topicId" element={<FlashcardPage />} />
        <Route path="/homibhabha" element={<HomibhabhaPage />} />
        <Route path="/ai-center" element={<ProtectedRoute><AICenterPage /></ProtectedRoute>} />
        
        <Route path="/account" element={<ProtectedRoute><AccountPage onOpenChangePasswordModal={onOpenChangePasswordModal} /></ProtectedRoute>} />
        <Route path="/quiz/:topicId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/quiz/challenge-:challengeId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        
        <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="/results/:resultId" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />

        <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;