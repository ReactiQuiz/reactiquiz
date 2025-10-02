la// src/components/home/AboutSummarySection.tsx
import React from 'react';
import { Container, Typography, useTheme, Box, useMediaQuery, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { AnimatedSection } from '../animations/AnimationUtils';
import { TiltCard } from '../animations/AnimatedCard';
import { PrimaryAnimatedButton } from '../animations/AnimatedButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { darken, alpha } from '@mui/material/styles';

function AboutSummarySection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 60,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <Box
      sx={{ 
        py: { xs: 24, sm: 32 },
        relative: 'relative',
        overflow: 'hidden'
      }}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Background Elements */}
      <div
        className="absolute top-[20%] left-[5%] w-24 h-24 rounded-full bg-gradient-radial from-purple-600/30 to-transparent animate-xy-oscillate z-0"
      />
      
      <div
        className="absolute bottom-[20%] right-[8%] w-20 h-20 rounded-[30%] bg-gradient-to-br from-purple-600/20 to-blue-500/20 animate-rotate-360 z-0"
      />

      <Container maxWidth="lg" className="relative z-10">
        <div className="animate-fadeInUp scroll-animate-fadeInUp">
          <div 
            className="text-center bg-gradient-to-br from-white/95 to-purple-200/20 backdrop-blur-lg border border-purple-300/30 rounded-lg relative overflow-hidden shadow-lg"
            style={{ borderImageSlice: 1, borderImageSource: 'linear-gradient(90deg, #7c3aed, #8b5cf6)' }}
          >
            <div className="p-10 sm:p-12 md:p-16">
              {/* Question mark decoration */}
              <div className="absolute top-5 right-5 text-3xl font-bold text-purple-500/10 scale-100 rotate-0 animate-scale-rotate">
                ?
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                What is ReactiQuiz?
              </h2>
              
              <p className="text-lg sm:text-xl max-w-3xl mx-auto text-gray-300 mb-10 font-normal">
                ReactiQuiz is a <span className="font-semibold text-purple-600">dynamic and engaging</span> quiz application designed to help users test and improve their knowledge across various subjects. Whether you're preparing for exams, looking to learn something new, or just want to challenge yourself, ReactiQuiz offers a <span className="font-semibold text-indigo-600">rich and interactive experience</span>.
              </p>
              
              <div className="text-center">
                <PrimaryAnimatedButton
                  animationType="glow"
                  size="large"
                  endIcon={
                    <div className="animate-x-oscillate">
                      <ArrowForwardIcon />
                    </div>
                  }
                  onClick={() => navigate('/about')}
                  className="py-3 px-6 text-lg font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
                >
                  Learn More About Us
                </PrimaryAnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Box>
  );
}

export default AboutSummarySection;