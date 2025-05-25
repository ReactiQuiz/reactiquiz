import { useState } from 'react';
import {
  BrowserRouter as Router
} from 'react-router-dom';
import {
  ThemeProvider, CssBaseline, Box
} from '@mui/material';
import {
  darkTheme
} from './theme';
import AppDrawer from './components/AppDrawer';
import Footer from './components/Footer';
import NavBar from './components/Navbar';
import AppRoutes from './components/AppRoutes';

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
          {/* ----NavBar---- */}
          <NavBar onIconButtonClick={handleDrawerToggle} />
          {/* ----AppDrawer---- */}
          <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />
          {/* ----Routes---- */}
          <AppRoutes />
          {/* ----Footer---- */}
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;