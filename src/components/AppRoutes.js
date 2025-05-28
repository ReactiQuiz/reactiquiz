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

function AppRoutes() {
    return (
        <Container component="main" sx={{ flexGrow: 1, py: 3, mt: '64px' }}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chemistry" element={<ChemistryPage />} />
                <Route path="/physics" element={<PhysicsPage />} />
                <Route path="/mathematics" element={<MathematicsPage />} />
                <Route path="/biology" element={<BiologyPage />} />
                <Route path="/homibhabha" element={<HomibhabhaPage />} />
                <Route path="/gk" element={<GKPage />} />
                <Route path="/quiz/:topicId" element={<QuizPage />} />
                <Route path="/results" element={<ResultsPage />} />
            </Routes>
        </Container>
    )
}

export default AppRoutes;   