// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Typography, Toolbar } from '@mui/material';
import darkTheme from './theme'; // Import the dark theme
import NavbarLayout from './components/navbar/Navbar'; // Renaming import for clarity, file is still Navbar.js

// Placeholder components for your routes
const QuizPage = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4">Quiz Page</Typography>
    <Typography>Welcome! Start your quiz here.</Typography>
  </Box>
);

const ResultsPage = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4">Results Page</Typography>
    <Typography>View your quiz results.</Typography>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Ensures consistent baseline styling and applies background color */}
      <Router>
        {/* NavbarLayout will now manage the AppBar, Drawer, and main content area */}
        <NavbarLayout>
          {/* The Toolbar component here acts as a spacer for the fixed AppBar */}
          {/* It's placed here because NavbarLayout's Main content area will start after its own Toolbar spacer */}
          {/* This ensures content within Routes isn't hidden by the AppBar */}
          <Toolbar />
          <Routes>
            <Route path="/" element={<QuizPage />} />
            <Route path="/results" element={<ResultsPage />} />
            {/* You can add more routes here */}
          </Routes>
        </NavbarLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;