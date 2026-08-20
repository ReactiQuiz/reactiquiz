// src/components/layout/MinimalLayout.tsx
/**
 * Minimal Layout Component
 * 
 * This component provides a minimal layout structure for guest/public pages.
 * It includes a simple navigation bar (without drawer) and footer.
 * Used for pages like About, Privacy Policy, Terms of Service, and Contact.
 */
import React from 'react';
import { Box, Toolbar } from '@mui/material';
import NavBar from '../core/Navbar';
import Footer from '../core/Footer';
import { Outlet } from 'react-router-dom';

/**
 * Minimal Layout Component
 * 
 * Minimal layout for public/guest pages. Provides:
 * - Simple navigation bar (Navbar hides menu icon for guests)
 * - Main content area with routing outlet
 * - Footer at the bottom
 * 
 * This layout is used for pages that don't require authentication
 * and don't need the drawer navigation menu.
 * 
 * @returns {JSX.Element} Minimal layout with navbar, content, and footer
 */
const MinimalLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Bar
          The Navbar is smart enough to hide the menu icon for guests */}
      <NavBar />
      
      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar spacer to account for fixed AppBar */}
        <Toolbar />
        
        {/* Renders the child route, e.g., AboutPage, PrivacyPolicyPage, etc. */}
        <Outlet />
      </Box>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default MinimalLayout;