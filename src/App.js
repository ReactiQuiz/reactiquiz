// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Typography, Toolbar } from '@mui/material'; // Keep Box, Typography if used by placeholder pages
import darkTheme from './theme';
import NavbarLayout from './components/navbar/Navbar'; // Path to your NavbarLayout

// --- Import Page Components ---
// Placeholder pages (can be removed if subjects are the only focus now)
// const QuizPage = () => (
//   <Box sx={{ p: 3 }}>
//     <Typography variant="h4">Home / General Quiz Page</Typography>
//     <Typography>Welcome! Select a subject from the menu or start a general quiz here.</Typography>
//   </Box>
// );

// const ResultsPage = () => (
//   <Box sx={{ p: 3 }}>
//     <Typography variant="h4">Results Page</Typography>
//     <Typography>View your quiz results.</Typography>
//   </Box>
// );

// Import specific page components (adjust paths if needed)
import HomePage from './pages/HomePage'; // Example: Create a dedicated HomePage.js if needed
import ResultsPage from './pages/ResultsPage'; // Example: Move ResultsPage logic to its own file
import ChemistryPage from './pages/ChemistryPage';
import PhysicsPage from './pages/PhysicsPage';
import MathematicsPage from './pages/MathematicsPage';
import BiologyPage from './pages/BiologyPage';


// --- For simplicity, let's refine QuizPage and ResultsPage to also be imported from src/pages ---
// You should create these files in src/pages if you haven't already, similar to the subject pages.
// For now, I'll assume you'll create:
// src/pages/HomePage.js (for the '/' route)
// src/pages/ResultsPage.js (for the '/results' route)

// If you haven't created HomePage.js and ResultsPage.js in src/pages,
// you can use the inline versions for now:
const SimpleHomePage = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4">Welcome to ReactiQuiz!</Typography>
    <Typography>Please select a subject from the menu to start a quiz.</Typography>
  </Box>
);
const SimpleResultsPage = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4">Quiz Results</Typography>
    <Typography>Your quiz scores will be displayed here.</Typography>
  </Box>
);


function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <NavbarLayout>
          <Toolbar /> {/* Spacer for the fixed AppBar */}
          <Routes>
            {/* Update routes to use imported page components */}
            <Route path="/" element={<SimpleHomePage />} /> {/* Or <HomePage /> if you created it */}
            <Route path="/results" element={<SimpleResultsPage />} /> {/* Or <ResultsPage /> */}
            <Route path="/chemistry" element={<ChemistryPage />} />
            <Route path="/physics" element={<PhysicsPage />} />
            <Route path="/mathematics" element={<MathematicsPage />} />
            <Route path="/biology" element={<BiologyPage />} />
            {/* You can add more routes here */}
          </Routes>
        </NavbarLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;