// src/pages/HomePage.tsx
/**
 * Home Page
 * 
 * This is the main landing page of the application. It displays
 * the hero section, about summary, key features, and call-to-action
 * sections. Includes an inline ad banner between sections.
 */
import React from 'react';
import { Box } from '@mui/material';
import PageTransition from '../components/animations/PageTransition';
import HeroSection from '../components/home/HeroSection';
import AboutSummarySection from '../components/home/AboutSummarySection';
import KeyFeaturesSection from '../components/home/KeyFeaturesSection';
import CallToActionSection from '../components/home/CallToActionSection';
import AdBanner from '../components/ads/AdBanner';

/**
 * Home Page Component
 * 
 * Displays the main landing page with:
 * - Hero section with branding and CTAs
 * - About summary section
 * - Inline ad banner
 * - Key features showcase
 * - Call-to-action section
 * - Page transition animations
 * - Staggered animations for sections
 * 
 * This page is accessible to both authenticated and guest users.
 * 
 * @returns {JSX.Element} Home page with all sections
 */
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
        
        {/* Ad Banner */}
        <div className="animate-slideUp delay-300">
          <AdBanner position="inline" />
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
