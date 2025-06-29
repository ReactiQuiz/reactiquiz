// src/components/core/AppRoutes.js
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Page Imports
import HomePage from '../pages/HomePage';
import AllSubjectsPage from '../pages/AllSubjectsPage';
import SubjectTopicsPage from '../pages/SubjectTopicsPage';
import DashboardPage from '../pages/DashboardPage';
import HomibhabhaPage from '../pages/HomibhabhaPage';
import QuizPage from '../pages/QuizPage';
import ResultsPage from '../pages/ResultsPage';
import AboutPage from '../pages/AboutPage';
import AccountPage from '../pages/AccountPage';
import LoginPage from '../pages/LoginPage';
import FlashcardPage from '../pages/FlashcardPage';
import FriendsPage from '../pages/FriendsPage';
import ChallengesPage from '../pages/ChallengesPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './core/ProtectedRoute';

function AppRoutes({ onOpenChangePasswordModal }) {
  const { currentUser, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Root Path of the app */}
      <Route path="/" element={currentUser ? <Navigate to="/subjects" replace /> : <HomePage />} />

      {/* Authentication Routes */}
      <Route path="/login" element={currentUser ? <Navigate to="/subjects" replace /> : <LoginPage />} />

      {/* Publicly Accessible Content Pages */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/subjects" element={<AllSubjectsPage />} />
      <Route path="/subjects/:subjectKey" element={<SubjectTopicsPage />} />
      <Route path="/flashcards/:topicId" element={<FlashcardPage />} />
      <Route path="/homibhabha" element={<HomibhabhaPage />} />

      {/* Protected Routes */}
      <Route path="/account" element={<ProtectedRoute><AccountPage onOpenChangePasswordModal={onOpenChangePasswordModal} /></ProtectedRoute>} />
      <Route path="/quiz/:topicId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
      <Route path="/quiz/challenge-:challengeId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
      
      {/* Results routes: one for the list, one for a specific result by ID */}
      <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
      <Route path="/results/:resultId" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />

      <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
      <Route path="/challenges" element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

      {/* Fallback Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;