// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Toolbar } from '@mui/material'; // Removed Box, Typography if not used directly in App.js
import darkTheme from './theme';
import NavbarLayout from './components/navbar/Navbar';

// --- Import Page Components with updated paths ---
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import ChemistryPage from './pages/chemistry/ChemistryPage'; // Updated path
import PhysicsPage from './pages/physics/PhysicsPage';     // Updated path
import MathematicsPage from './pages/mathematics/MathematicsPage'; // Updated path
import BiologyPage from './pages/biology/BiologyPage';     // Updated path
import QuizPage from './pages/quiz/QuizPage'; // <<< IMPORT THE NEW QUIZ PAGE


function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <NavbarLayout>
          <Toolbar /> {/* Spacer for the fixed AppBar */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/chemistry" element={<ChemistryPage />} />
            <Route path="/physics" element={<PhysicsPage />} />
            <Route path="/mathematics" element={<MathematicsPage />} />
            <Route path="/biology" element={<BiologyPage />} />
            <Route path="/quiz/:subject/:topicId" element={<QuizPage />} />
          </Routes>
        </NavbarLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
