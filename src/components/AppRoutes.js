// src/components/AppRoutes.js
import {
    Routes, Route
} from 'react-router-dom';
import {
    Container,
} from '@mui/material';
import HomePage from '../pages/HomePage';
import ChemistryPage from '../pages/ChemistryPage';
import PhysicsPage from '../pages/PhysicsPage';
import MathematicsPage from '../pages/MathematicsPage';
import BiologyPage from '../pages/BiologyPage';
import HomibhabhaPage from '../pages/HomibhabhaPage';
import GKPage from '../pages/GKPage';
import QuizPage from '../pages/QuizPage';
import ResultsPage from '../pages/ResultsPage';
import AboutPage from '../pages/AboutPage';
import AccountPage from '../pages/AccountPage';
import ConfirmDevicePage from '../pages/ConfirmDevicePage';
import FlashcardPage from '../pages/FlashcardPage';
import FriendsPage from '../pages/FriendsPage'; // <-- IMPORT FriendsPage
import ChallengesPage from '../pages/ChallengesPage';

function AppRoutes({
    currentUser,
    handleLogout,
    authError, // This might be the general authError for login/register forms
    setAuthError, // Setter for the general authError
    setCurrentUser,
    onOpenChangePasswordModal
}) {
    return (
        <Container component="main" sx={{ flexGrow: 1, py: 3, mt: '64px' }}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route
                    path="/account"
                    element={
                        <AccountPage
                            currentUser={currentUser}
                            handleLogout={handleLogout}
                            authError={authError} // Pass the general authError here
                            setAuthError={setAuthError} // Pass the setter
                            setCurrentUser={setCurrentUser}
                            onOpenChangePasswordModal={onOpenChangePasswordModal}
                        />
                    }
                />
                <Route path="/chemistry" element={<ChemistryPage />} />
                <Route path="/physics" element={<PhysicsPage />} />
                <Route path="/mathematics" element={<MathematicsPage />} />
                <Route path="/biology" element={<BiologyPage />} />
                <Route path="/homibhabha" element={<HomibhabhaPage />} />
                <Route path="/gk" element={<GKPage />} />
                <Route path="/quiz/:topicId" element={<QuizPage currentUser={currentUser} />} />
                <Route path="/results" element={<ResultsPage currentUser={currentUser} />} />
                <Route path="/confirm-device" element={<ConfirmDevicePage setCurrentUser={setCurrentUser} />} />
                <Route path="/challenges" element={<ChallengesPage currentUser={currentUser} />} />
                <Route path="/quiz/challenge-:challengeId" element={<QuizPage currentUser={currentUser} />} />
                <Route path="/friends" element={<FriendsPage currentUser={currentUser} />} />
                <Route path="/flashcards/:topicId" element={<FlashcardPage />} />
            </Routes>
        </Container>
    )
}

export default AppRoutes;