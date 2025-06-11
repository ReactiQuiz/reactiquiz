// src/components/AppRoutes.js
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ChemistryPage from '../pages/ChemistryPage';
import PhysicsPage from '../pages/PhysicsPage';
import MathematicsPage from '../pages/MathematicsPage';
import BiologyPage from '../pages/BiologyPage';
import GKPage from '../pages/GKPage';
import HomibhabhaPage from '../pages/HomibhabhaPage';
import QuizPage from '../pages/QuizPage';
import ResultsPage from '../pages/ResultsPage';
import AboutPage from '../pages/AboutPage';
import AccountPage from '../pages/AccountPage';
import ConfirmDevicePage from '../pages/ConfirmDevicePage';
import FlashcardPage from '../pages/FlashcardPage';
import FriendsPage from '../pages/FriendsPage';
import ChallengesPage from '../pages/ChallengesPage';
import DashboardPage from '../pages/DashboardPage'; // <-- IMPORT DashboardPage

function AppRoutes({ 
  currentUser, 
  handleLogout, 
  authError, 
  setAuthError, 
  setCurrentUser,
  onOpenChangePasswordModal 
}) {
  return (
    <Routes>
      <Route path="/" element={<HomePage currentUser={currentUser} />} /> {/* Pass currentUser */}
      <Route path="/dashboard" element={currentUser ? <DashboardPage currentUser={currentUser} /> : <Navigate to="/account" state={{ message: "Please login to view dashboard."}} replace />} /> {/* <-- ADD Dashboard Route */}
      <Route path="/chemistry" element={<ChemistryPage />} />
      <Route path="/physics" element={<PhysicsPage />} />
      <Route path="/mathematics" element={<MathematicsPage />} />
      <Route path="/biology" element={<BiologyPage />} />
      <Route path="/gk" element={<GKPage />} />
      <Route path="/homibhabha" element={<HomibhabhaPage />} />
      <Route path="/quiz/:topicId" element={<QuizPage currentUser={currentUser} />} />
      <Route path="/quiz/challenge-:challengeId" element={<QuizPage currentUser={currentUser} />} />
      <Route path="/results" element={<ResultsPage currentUser={currentUser} />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/account" element={
        <AccountPage 
          currentUser={currentUser} 
          handleLogout={handleLogout} 
          authError={authError} 
          setAuthError={setAuthError} 
          setCurrentUser={setCurrentUser}
          onOpenChangePasswordModal={onOpenChangePasswordModal}
        />} 
      />
      <Route path="/confirm-device" element={<ConfirmDevicePage setCurrentUser={setCurrentUser} />} />
      <Route path="/flashcards/:topicId" element={<FlashcardPage />} />
      <Route path="/friends" element={<FriendsPage currentUser={currentUser} />} />
      <Route path="/challenges" element={<ChallengesPage currentUser={currentUser} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;