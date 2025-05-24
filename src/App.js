// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography,
  Container, IconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import HomePage from './pages/HomePage';
import ChemistryPage from './pages/ChemistryPage';
import PhysicsPage from './pages/PhysicsPage';
import MathematicsPage from './pages/MathematicsPage';
import BiologyPage from './pages/BiologyPage';
import QuizPage from './pages/QuizPage'; // <<< ENSURE THIS PATH IS CORRECT
import ResultsPage from './pages/ResultsPage';
import AppDrawer from './components/AppDrawer';

import { darkTheme } from './theme';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="fixed">
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                ReactiQuiz
              </Typography>
            </Toolbar>
          </AppBar>

          <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />

          <Container component="main" sx={{ flexGrow: 1, py: 3, mt: '64px' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chemistry" element={<ChemistryPage />} />
              <Route path="/physics" element={<PhysicsPage />} />
              <Route path="/mathematics" element={<MathematicsPage />} />
              <Route path="/biology" element={<BiologyPage />} />
              <Route path="/quiz/:subject/:topicId" element={<QuizPage />} />
              <Route path="/results" element={<ResultsPage />} />
            </Routes>
          </Container>
           <Box component="footer" sx={{ bgcolor: 'background.paper', p: 2, textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} ReactiQuiz. All Rights Reserved.
            </Typography>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;