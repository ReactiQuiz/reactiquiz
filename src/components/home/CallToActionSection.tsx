// src/components/home/CallToActionSection.tsx
import React from 'react';
import { Container, Typography, useTheme, Box, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { AnimatedSection, fadeInUp } from '../animations/AnimationUtils';
import { PulseButton } from '../animations/AnimatedButton';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';
import { darken, alpha } from '@mui/material/styles';

function CallToActionSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      py: { xs: 8, sm: 10 },
      position: 'relative',
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.primary.main, 0.05)} 0%,
        ${alpha(theme.palette.secondary.main, 0.08)} 50%,
        ${alpha(theme.palette.primary.main, 0.05)} 100%
      )`,
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
          transition: {
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }
        }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: isMobile ? 150 : 200,
          height: isMobile ? 150 : 200,
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 0
        }}
      />
      
      <motion.div
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
          transition: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '5%',
          width: isMobile ? 100 : 150,
          height: isMobile ? 100 : 150,
          background: `linear-gradient(45deg, ${alpha(theme.palette.secondary.main, 0.06)}, ${alpha(theme.palette.primary.main, 0.04)})`,
          borderRadius: '30%',
          zIndex: 0
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <AnimatedSection variants={fadeInUp}>
          {/* Animated Icons */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: isMobile ? 20 : 30,
              marginBottom: theme.spacing(3)
            }}
          >
            <motion.div
              animate={{
                y: [-5, 5, -5],
                rotate: [-5, 5, -5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Box
                sx={{
                  width: { xs: 50, sm: 60 },
                  height: { xs: 50, sm: 60 },
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
              >
                <RocketLaunchIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: 'white' }} />
              </Box>
            </motion.div>
            
            <motion.div
              animate={{
                y: [5, -5, 5],
                rotate: [5, -5, 5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Box
                sx={{
                  width: { xs: 50, sm: 60 },
                  height: { xs: 50, sm: 60 },
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: 'white' }} />
              </Box>
            </motion.div>
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 2
              }}
            >
              Ready to Start Learning?
            </Typography>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                color: theme.palette.text.secondary, 
                fontSize: { xs: '1rem', sm: '1.2rem' },
                lineHeight: 1.6,
                fontWeight: 400,
                maxWidth: '500px',
                mx: 'auto'
              }}
            >
              Dive into a world of knowledge, challenge your friends, and track your progress.
              <Box component="span" sx={{ display: 'block', mt: 1, fontWeight: 600, color: theme.palette.primary.main }}>
                ReactiQuiz is here to make learning fun and effective.
              </Box>
            </Typography>
          </motion.div>

          {/* Call to Action Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <PulseButton
              size="large"
              startIcon={
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <RocketLaunchIcon />
                </motion.div>
              }
              onClick={() => navigate('/login')}
              sx={{
                py: { xs: 2, sm: 2.5 },
                px: { xs: 4, sm: 6 },
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
                fontWeight: 700,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                textTransform: 'none',
                '&:hover': {
                  background: `linear-gradient(135deg, ${darken(theme.palette.primary.main, 0.1)} 0%, ${darken(theme.palette.secondary.main, 0.1)} 100%)`,
                  boxShadow: '0 16px 50px rgba(0,0,0,0.25)'
                }
              }}
            >
              Get Started Now
            </PulseButton>
          </motion.div>

          {/* Additional encouragement text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ marginTop: theme.spacing(3) }}
          >
            <Typography
              variant="body2"
              sx={{
                color: alpha(theme.palette.text.secondary, 0.7),
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                fontStyle: 'italic'
              }}
            >
              🚀 Join thousands of learners already on their journey
            </Typography>
          </motion.div>
        </AnimatedSection>
      </Container>
    </Box>
  );
}

export default CallToActionSection;