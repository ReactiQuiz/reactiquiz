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
import AccountPage from '../pages/AccountPage'; // Page for logged-in user profile
import LoginPage from '../pages/LoginPage';     // NEW page for login/register forms
//import ConfirmDevicePage from '../pages/ConfirmDevicePage';
import FlashcardPage from '../pages/FlashcardPage';
import FriendsPage from '../pages/FriendsPage';
import ChallengesPage from '../pages/ChallengesPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './core/ProtectedRoute';

function AppRoutes({
  // Removed authError, setAuthError as LoginPage will manage its own form errors
  onOpenChangePasswordModal // Still pass this to AccountPage for the logged-in view
}) {
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
      {/* Root Path */}
      <Route path="/" element={currentUser ? <Navigate to="/subjects" replace /> : <HomePage />} />

      {/* Authentication Routes */}
      <Route path="/login" element={currentUser ? <Navigate to="/subjects" replace /> : <LoginPage />} />
      {/*<Route path="/confirm-device" element={<ConfirmDevicePage />} /> {/* ConfirmDevice will use useAuth().login */}

      {/* Publicly Accessible Content Pages */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/subjects" element={<AllSubjectsPage />} />
      <Route path="/subjects/:subjectKey" element={<SubjectTopicsPage />} />
      <Route path="/flashcards/:topicId" element={<FlashcardPage />} />
      <Route path="/homibhabha" element={<HomibhabhaPage />} />

      {/* Protected Routes */}
      <Route path="/account" element={
        <ProtectedRoute message="Please login to view your account.">
          <AccountPage onOpenChangePasswordModal={onOpenChangePasswordModal} />
        </ProtectedRoute>
      } />
      <Route path="/quiz/:topicId" element={
        <ProtectedRoute message="Please login to start a quiz.">
          <QuizPage />
        </ProtectedRoute>
      } />
      <Route path="/quiz/challenge-:challengeId" element={
        <ProtectedRoute message="Please login to play a challenge.">
          <QuizPage />
        </ProtectedRoute>
      } />
      <Route path="/results" element={
        <ProtectedRoute message="Please login to view your results.">
          <ResultsPage />
        </ProtectedRoute>
      } />
      <Route path="/friends" element={
        <ProtectedRoute message="Please login to manage your friends.">
          <FriendsPage />
        </ProtectedRoute>
      } />
      <Route path="/challenges" element={
        <ProtectedRoute message="Please login to view your challenges.">
          <ChallengesPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute message="Please login to view your dashboard.">
          <DashboardPage />
        </ProtectedRoute>
      } />

      {/* Fallback Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;