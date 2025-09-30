// src/components/home/AboutSummarySection.tsx
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
    <Box sx={{ 
      py: { xs: 6, sm: 8 },
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Elements */}
      <motion.div
        animate={{
          x: [-20, 20, -20],
          y: [-10, 10, -10],
          transition: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        style={{
          position: 'absolute',
          top: '20%',
          left: '5%',
          width: isMobile ? 100 : 150,
          height: isMobile ? 100 : 150,
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 0
        }}
      />
      
      <motion.div
        animate={{
          x: [20, -20, 20],
          y: [10, -10, 10],
          rotate: [0, 180, 360],
          transition: {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '8%',
          width: isMobile ? 80 : 120,
          height: isMobile ? 80 : 120,
          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.06)}, ${alpha(theme.palette.secondary.main, 0.04)})`,
          borderRadius: '30%',
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <AnimatedSection variants={cardVariants}>
          <TiltCard 
            elevation={0}
            sx={{ 
              textAlign: 'center',
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                ${alpha(theme.palette.primary.main, 0.02)} 100%
              )`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }
            }}
            >
            <CardContent sx={{ p: { xs: 4, sm: 5, md: 6 } }}>
              {/* Question mark decoration */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  fontSize: isMobile ? '2rem' : '3rem',
                  color: alpha(theme.palette.primary.main, 0.1),
                  fontWeight: 'bold'
                }}
              >
                ?
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Typography 
                  variant="h3" 
                  component="h2" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 3
                  }}
                >
                  What is ReactiQuiz?
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, 
                    lineHeight: 1.8, 
                    maxWidth: '700px', 
                    margin: '0 auto', 
                    color: theme.palette.text.secondary,
                    mb: 4,
                    fontWeight: 400
                  }}
                >
                  ReactiQuiz is a <Box component="span" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>dynamic and engaging</Box> quiz application designed to help users test and improve their knowledge across various subjects. Whether you're preparing for exams, looking to learn something new, or just want to challenge yourself, ReactiQuiz offers a <Box component="span" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>rich and interactive experience</Box>.
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <PrimaryAnimatedButton
                  animationType="glow"
                  size="large"
                  endIcon={
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowForwardIcon />
                    </motion.div>
                  }
                  onClick={() => navigate('/about')}
                  sx={{
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 3, sm: 4 },
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 600,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    textTransform: 'none',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${darken(theme.palette.primary.main, 0.1)} 0%, ${darken(theme.palette.secondary.main, 0.1)} 100%)`,
                      boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  Learn More About Us
                </PrimaryAnimatedButton>
              </motion.div>
            </CardContent>
          </TiltCard>
        </AnimatedSection>
      </Container>
    </Box>
  );
}

export default AboutSummarySection;