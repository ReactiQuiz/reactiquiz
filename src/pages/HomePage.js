// src/pages/HomePage.js
import React from 'react';
import { Box } from '@mui/material';
import HeroSection from '../components/home/HeroSection';
import AboutSummarySection from '../components/home/AboutSummarySection'; // <-- Import new component
import KeyFeaturesSection from '../components/home/KeyFeaturesSection';
import CallToActionSection from '../components/home/CallToActionSection';

function HomePage() {
  return (
    <Box sx={{ width: '100%' }}>
      <HeroSection />
      <AboutSummarySection /> {/* <-- Add the new section here */}
      <KeyFeaturesSection />
      <CallToActionSection />
    </Box>
  );
}

export default HomePage;