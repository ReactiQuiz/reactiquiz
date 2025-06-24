// src/pages/HomePage.js
import React from 'react';
import { Box } from '@mui/material';

// Import the new section components
import HeroSection from '../components/home/HeroSection';
import AboutSummarySection from '../components/home/AboutSummarySection';
import KeyFeaturesSection from '../components/home/KeyFeaturesSection';
import HomiBhabhaSpotlight from '../components/home/HomiBhabhaSpotlight';
import CallToActionSection from '../components/home/CallToActionSection';

function HomePage() {
  // AppRoutes handles redirection if user is logged in.
  // This page is for logged-out users.

  return (
    <Box sx={{ width: '100%' }}> {/* Ensures sections can be full width if they choose */}
      <HeroSection />
      <Box sx={{ my: { xs: 1, sm: 2 } }} /> {/* Add small margin between sections */}
      <AboutSummarySection />
      <Box sx={{ my: { xs: 1, sm: 2 } }} />
      <KeyFeaturesSection />
      <Box sx={{ my: { xs: 1, sm: 2 } }} />
      <HomiBhabhaSpotlight />
      <CallToActionSection /> {/* CallToActionSection has its own top/bottom padding */}
    </Box>
  );
}

export default HomePage;