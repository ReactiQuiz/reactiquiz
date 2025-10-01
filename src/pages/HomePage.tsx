// src/pages/HomePage.tsx
import React from 'react';
import { Box } from '@mui/material';
import PageTransition from '../components/animations/PageTransition';
import HeroSection from '../components/home/HeroSection';
import AboutSummarySection from '../components/home/AboutSummarySection';
import KeyFeaturesSection from '../components/home/KeyFeaturesSection';
import CallToActionSection from '../components/home/CallToActionSection';

const HomePage: React.FC = () => {
  return (
    <PageTransition>
      <Box sx={{ width: '100%' }} className="animate-fadeIn">
        <div className="animate-slideUp">
          <HeroSection />
        </div>
        
        <div className="animate-slideUp delay-200">
          <AboutSummarySection />
        </div>
        
        <div className="animate-slideUp delay-400">
          <KeyFeaturesSection />
        </div>
        
        <div className="animate-slideUp delay-600">
          <CallToActionSection />
        </div>
      </Box>
    </PageTransition>
  );
};

export default HomePage;
