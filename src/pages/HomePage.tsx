// src/pages/HomePage.tsx
import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import PageTransition from '../components/animations/PageTransition';
import HeroSection from '../components/home/HeroSection';
import AboutSummarySection from '../components/home/AboutSummarySection';
import KeyFeaturesSection from '../components/home/KeyFeaturesSection';
import CallToActionSection from '../components/home/CallToActionSection';

const HomePage: React.FC = () => {
  const sectionVariants = {
    initial: { opacity: 0, y: 60 },
    animate: { 
      opacity: 1, 
      y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
    }
  };

  return (
    <PageTransition>
      <Box 
        component={motion.div}
        sx={{ width: '100%' }}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: {
            duration: 0.8,
            staggerChildren: 0.2
          }
        }}
      >
        <motion.div variants={sectionVariants}>
          <HeroSection />
        </motion.div>
        
        <motion.div variants={sectionVariants}>
          <AboutSummarySection />
        </motion.div>
        
        <motion.div variants={sectionVariants}>
          <KeyFeaturesSection />
        </motion.div>
        
        <motion.div variants={sectionVariants}>
          <CallToActionSection />
        </motion.div>
      </Box>
    </PageTransition>
  );
};

export default HomePage;
