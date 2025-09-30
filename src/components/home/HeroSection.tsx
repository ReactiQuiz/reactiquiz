// src/components/home/HeroSection.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ParticleField, floatingAnimation, fadeInUp, hoverScale } from '../animations/AnimationUtils';
import { GlowButton } from '../animations/AnimatedButton';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlashOnIcon from '@mui/icons-material/FlashOn';

function HeroSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const controls = useAnimation();
  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const glowingVariants = {
    initial: { 
      boxShadow: '0 0 0 rgba(79, 172, 254, 0)',
      textShadow: '0 0 0 rgba(255, 255, 255, 0)'
    },
    animate: {
      boxShadow: [
        '0 0 20px rgba(79, 172, 254, 0.3)',
        '0 0 40px rgba(79, 172, 254, 0.5)',
        '0 0 20px rgba(79, 172, 254, 0.3)'
      ],
      textShadow: [
        '0 0 10px rgba(255, 255, 255, 0.5)',
        '0 0 20px rgba(255, 255, 255, 0.8)',
        '0 0 10px rgba(255, 255, 255, 0.5)'
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const iconFeatures = [
    { icon: SchoolIcon, text: 'Learn', delay: 0.1 },
    { icon: TrendingUpIcon, text: 'Grow', delay: 0.2 },
    { icon: FlashOnIcon, text: 'Excel', delay: 0.3 }
  ];

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="initial"
      animate={controls}
      sx={{
        position: 'relative',
        minHeight: { xs: '100vh', sm: '90vh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.dark, 0.95)} 0%, 
          ${alpha(theme.palette.secondary.dark, 0.9)} 35%,
          ${alpha(theme.palette.primary.main, 0.85)} 70%,
          ${alpha(theme.palette.secondary.main, 0.8)} 100%
        )`,
        color: theme.palette.common.white,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }
      }}
    >
      {/* Animated Background Particles */}
      <ParticleField count={isMobile ? 15 : 30} />

      {/* Floating geometric shapes */}
      <motion.div
        variants={floatingAnimation}
        animate="animate"
        style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: isMobile ? 80 : 120,
          height: isMobile ? 80 : 120,
          background: `linear-gradient(45deg, ${alpha(theme.palette.secondary.light, 0.3)}, ${alpha(theme.palette.primary.light, 0.2)})`,
          borderRadius: '50%',
          filter: 'blur(1px)',
          zIndex: 1
        }}
      />
      
      <motion.div
        variants={floatingAnimation}
        animate="animate"
        transition={{ delay: 1, duration: 5 }}
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '5%',
          width: isMobile ? 60 : 90,
          height: isMobile ? 60 : 90,
          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.light, 0.25)}, ${alpha(theme.palette.secondary.light, 0.15)})`,
          borderRadius: '30%',
          filter: 'blur(2px)',
          zIndex: 1
        }}
      />

      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 2,
          textAlign: 'center',
          px: { xs: 2, sm: 3 }
        }}
      >
        {/* Main Hero Content */}
        <motion.div variants={fadeInUp}>
          <Typography
            component={motion.h1}
            variants={glowingVariants}
            animate="animate"
            variant="h1"
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' }, 
              letterSpacing: '-0.02em',
              lineHeight: { xs: 1.2, sm: 1.1 },
              mb: 2,
              background: `linear-gradient(135deg, #fff 0%, ${theme.palette.secondary.light} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Welcome to{' '}
            <Box component="span" sx={{ display: { xs: 'block', sm: 'inline' } }}>
              ReactiQuiz!
            </Box>
          </Typography>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ 
              color: alpha(theme.palette.common.white, 0.9),
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              fontWeight: 400,
              lineHeight: 1.6,
              mb: 4,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Sharpen Your Mind, One Quiz at a Time.
            <Box component="span" sx={{ display: 'block', mt: 1 }}>
              Explore, Learn, and Challenge Yourself.
            </Box>
          </Typography>
        </motion.div>

        {/* Interactive Feature Icons */}
        <motion.div
          variants={{
            initial: { opacity: 0, y: 30 },
            animate: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.6,
                staggerChildren: 0.1,
                delayChildren: 0.8
              }
            }
          }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? 20 : 40,
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}
        >
          {iconFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                variants={{
                  initial: { opacity: 0, scale: 0.5, y: 20 },
                  animate: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: { delay: feature.delay, duration: 0.5 }
                  }
                }}
                whileHover={{ 
                  scale: 1.1,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <Box
                  sx={{
                    width: { xs: 60, sm: 80 },
                    height: { xs: 60, sm: 80 },
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.2)}, ${alpha(theme.palette.primary.light, 0.3)})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                    mb: 1
                  }}
                >
                  <IconComponent sx={{ fontSize: { xs: 28, sm: 36 }, color: 'white' }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha(theme.palette.common.white, 0.8),
                    fontWeight: 500,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}
                >
                  {feature.text}
                </Typography>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action Button */}
        <motion.div
          variants={fadeInUp}
          {...hoverScale}
        >
          <GlowButton
            size="large"
            onClick={() => navigate('/login')}
            glowColor={theme.palette.secondary.light}
            sx={{
              py: { xs: 1.5, sm: 2 },
              px: { xs: 3, sm: 4 },
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 600,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              textTransform: 'none',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.primary.dark} 100%)`
              }
            }}
          >
            Start Your Journey
          </GlowButton>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          variants={{
            initial: { opacity: 0, y: -20 },
            animate: {
              opacity: 1,
              y: 0,
              transition: { delay: 1.5, duration: 0.8 }
            }
          }}
          animate={{
            y: [0, 10, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            display: isMobile ? 'block' : 'block'
          }}
        >
          <Box
            sx={{
              width: 2,
              height: 40,
              background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.common.white, 0.6)})`,
              borderRadius: 1,
              mx: 'auto'
            }}
          />
        </motion.div>
      </Container>
    </Box>
  );
}

export default HeroSection;
