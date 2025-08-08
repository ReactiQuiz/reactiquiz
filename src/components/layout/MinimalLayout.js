// src/components/layout/MinimalLayout.js
import React from 'react';
import { Box, Toolbar } from '@mui/material';
import NavBar from '../core/Navbar';
import Footer from '../core/Footer';
import { Outlet } from 'react-router-dom';

function MinimalLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar /> {/* The Navbar is smart enough to hide the menu icon for guests */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        <Outlet /> {/* Renders the child route, e.g., AboutPage */}
      </Box>
      <Footer />
    </Box>
  );
}
export default MinimalLayout;