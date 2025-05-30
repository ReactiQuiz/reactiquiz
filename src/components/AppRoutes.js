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

function AppRoutes({ 
    currentUser, 
    handleLogin, 
    handleLogout, // Added handleLogout
    authError, 
    setAuthError, 
    deviceChangeInfo, 
    setDeviceChangeInfo, 
    requestDeviceChangeOtp, 
    confirmDeviceWithOtp 
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
                            handleLogin={handleLogin}
                            handleLogout={handleLogout} // Pass handleLogout
                            authError={authError}
                            setAuthError={setAuthError}
                            deviceChangeInfo={deviceChangeInfo}
                            setDeviceChangeInfo={setDeviceChangeInfo}
                            requestDeviceChangeOtp={requestDeviceChangeOtp}
                            confirmDeviceWithOtp={confirmDeviceWithOtp}
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
                <Route path="/results" element={<ResultsPage currentUser={currentUser}/>} />
            </Routes>
        </Container>
    )
}

export default AppRoutes;