// src/components/home/HeroSection.tsx
/**
 * Hero Section Component
 * 
 * This component displays the main hero section of the home page.
 * It includes animated background, particle effects, branding text,
 * call-to-action buttons, and feature highlights.
 */
import React from 'react';
import { Box, Typography, Container, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { ParticleField } from '../animations/AnimationUtils';
import SpaceBackground from '../animations/SpaceBackground';
import LiquidGlassButton from '../animations/LiquidGlassButton';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlashOnIcon from '@mui/icons-material/FlashOn';

/**
 * Hero Section Component
 * 
 * Displays the main hero section of the landing page. Features:
 * - Animated space background
 * - Particle field effects
 * - App branding and tagline
 * - Call-to-action buttons (Login/Register, Explore Subjects)
 * - Feature highlights (Learn, Grow, Excel)
 * - Responsive design for mobile and desktop
 * 
 * This component is used on the HomePage to create an engaging
 * first impression for visitors.
 * 
 * @returns {JSX.Element} Hero section with animations and CTA buttons
 */
function HeroSection() {
  // Get theme for styling
  const theme = useTheme();
  // Navigation hook for routing
  const navigate = useNavigate();
  // Check if device is mobile for responsive adjustments
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const iconFeatures = [
    { icon: SchoolIcon, text: 'Learn', delay: 0.1 },
    { icon: TrendingUpIcon, text: 'Grow', delay: 0.2 },
    { icon: FlashOnIcon, text: 'Excel', delay: 0.3 }
  ];

  return (
    <SpaceBackground>
      <Box
        sx={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          color: 'white',
          width: '100%',
        }}
        className="relative min-h-[90vh] flex items-center overflow-hidden text-white w-full"
      >
        {/* Animated Background Particles */}
        <ParticleField count={isMobile ? 15 : 30} />

        {/* Floating geometric shapes */}
        <div
          className="absolute top-[20%] right-[10%] w-20 h-20 rounded-full blur-sm z-20 bg-gradient-to-br from-purple-500/20 to-blue-400/10"
        />
        
        <div
          className="absolute bottom-[30%] left-[5%] w-16 h-16 rounded-[30%] blur-md z-20 bg-gradient-to-br from-blue-400/10 to-purple-500/05"
        />

        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 30,
            textAlign: 'center',
            px: { xs: 2, sm: 3 },
            width: '100%',
          }}
          className="relative z-30 text-center px-4 sm:px-6 w-full"
        >
        {/* Main Hero Content */}
        <div className="animate-fadeInUp scroll-animate-fadeInUp">
          <Typography
            component="h1"
            variant="h1"
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' }, 
              letterSpacing: '-0.02em',
              lineHeight: { xs: 1.2, sm: 1.1 },
              mb: 2,
              background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            className="font-extrabold text-5xl sm:text-7xl md:text-8xl mb-2 bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent"
          >
            Welcome to{' '}
            <span className="block sm:inline">
              ReactiQuiz!
            </span>
          </Typography>
        </div>

        <div className="animate-fadeInUp delay-200 scroll-animate-fadeInUp delay-scroll-200">
          <Typography
            variant="h5"
            component="h2"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              fontWeight: 400,
              lineHeight: 1.6,
              mb: 4,
              maxWidth: '600px',
              mx: 'auto'
            }}
            className="text-white/90 text-lg sm:text-xl max-w-xl mx-auto mb-6"
          >
            Sharpen Your Mind, One Quiz at a Time.
            <span className="block mt-1">
              Explore, Learn, and Challenge Yourself.
            </span>
          </Typography>
        </div>

        {/* Interactive Feature Icons */}
        <div
          className="flex justify-center gap-10 mb-8 flex-wrap"
        >
          {iconFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center cursor-pointer transform transition-transform duration-200 hover:scale-110 hover:-translate-y-1"
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
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-purple-400/20 to-blue-400/30 backdrop-blur border border-white/20 mb-1 flex items-center justify-center"
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
                  className="text-white/80 font-medium text-sm sm:text-base"
                >
                  {feature.text}
                </Typography>
              </div>
            );
          })}
        </div>

        {/* Call to Action Button */}
        <div className="animate-fadeInUp hover:scale-105 transition-transform duration-300 inline-block">
          <LiquidGlassButton
            variant="accent"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              py: { xs: 1.5, sm: 2 },
              px: { xs: 3, sm: 4 },
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 600,
            }}
          >
            Start Your Journey
          </LiquidGlassButton>
        </div>

        {/* Scroll Indicator */}
        <div
          className="animate-fadeInUp animate-bounce absolute bottom-8 left-1/2 transform -translate-x-1/2 block"
          style={{
            width: 2,
            height: 40,
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))',
            borderRadius: 4,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        />
        </Container>
      </Box>
    </SpaceBackground>
  );
}

export default HeroSection;
