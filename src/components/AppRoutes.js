// src/components/AppRoutes.js
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import HomibhabhaPage from '../pages/HomibhabhaPage';
import QuizPage from '../pages/QuizPage';
import ResultsPage from '../pages/ResultsPage';
import AboutPage from '../pages/AboutPage';
import AccountPage from '../pages/AccountPage';
import ConfirmDevicePage from '../pages/ConfirmDevicePage';
import FlashcardPage from '../pages/FlashcardPage';
import FriendsPage from '../pages/FriendsPage';
import ChallengesPage from '../pages/ChallengesPage';
import DashboardPage from '../pages/DashboardPage';
import AllSubjectsPage from '../pages/AllSubjectsPage';
import SubjectTopicsPage from '../pages/SubjectTopicsPage';
import { useAuth } from '../contexts/AuthContext'; // <-- IMPORT and USE

function AppRoutes({
  // REMOVED: currentUser, handleLogout, setCurrentUser from props
  authError,      // Keep for AccountPage's forms
  setAuthError,   // Keep for AccountPage's forms
  onOpenChangePasswordModal // Keep for AccountPage
}) {
  const { currentUser, isLoadingAuth } = useAuth(); // Get currentUser for route protection

  // Display a global loading indicator while initial authentication check is in progress
  if (isLoadingAuth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)' }}> {/* Adjust height as needed */}
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Navigate to="/subjects" replace /> : <HomePage />} />
      <Route path="/subjects" element={<AllSubjectsPage />} />
      <Route path="/subjects/:subjectKey" element={<SubjectTopicsPage />} />

      <Route path="/dashboard" element={currentUser ? <DashboardPage /> : <Navigate to="/account" state={{ message: "Please login to view dashboard."}} replace />} />

      <Route path="/quiz/:topicId" element={<QuizPage />} />
      <Route path="/quiz/challenge-:challengeId" element={<QuizPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/challenges" element={<ChallengesPage />} />

      <Route path="/homibhabha" element={<HomibhabhaPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/account" element={
        <AccountPage
          authError={authError}
          setAuthError={setAuthError}
          onOpenChangePasswordModal={onOpenChangePasswordModal}
        />}
      />
      <Route path="/confirm-device" element={<ConfirmDevicePage />} />
      <Route path="/flashcards/:topicId" element={<FlashcardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;