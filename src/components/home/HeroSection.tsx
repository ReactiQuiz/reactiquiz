// src/components/home/HeroSection.tsx
import React from 'react';
import { Box, Typography, Container, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { ParticleField } from '../animations/AnimationUtils';
import { GlowButton } from '../animations/AnimatedButton';
import ShaderAnimation from '../animations/ShaderAnimation';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlashOnIcon from '@mui/icons-material/FlashOn';

function HeroSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const iconFeatures = [
    { icon: SchoolIcon, text: 'Learn', delay: 0.1 },
    { icon: TrendingUpIcon, text: 'Grow', delay: 0.2 },
    { icon: FlashOnIcon, text: 'Excel', delay: 0.3 }
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#1a1a2e', // Fallback dark background
        color: 'white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 2
        }
      }}
      className="relative min-h-[90vh] flex items-center overflow-hidden text-white before:absolute before:inset-0 before:pointer-events-none before:z-20"
    >
      {/* Shader Animation Background */}
      <ShaderAnimation />
      
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
          zIndex: 40,
          textAlign: 'center',
          px: { xs: 2, sm: 3 },
          // Add backdrop blur and semi-transparent background for better text readability
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-2rem',
            left: '-2rem',
            right: '-2rem',
            bottom: '-2rem',
            background: 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(2px)',
            borderRadius: '2rem',
            zIndex: -1
          }
        }}
        className="relative z-40 text-center px-4 sm:px-6"
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
  );
}

export default HeroSection;
