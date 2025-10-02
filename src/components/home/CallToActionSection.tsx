// src/components/home/CallToActionSection.tsx
import React from 'react';
import { Container, Box } from '@mui/material';
import { PulseButton } from '../animations/AnimatedButton';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';

function CallToActionSection() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{ 
        py: { xs: 20, sm: 24 },
        position: 'relative',
        background: 'linear-gradient(135deg, #1e40af0d 0%, #7c3aed14 50%, #1e40af0d 100%)',
        overflow: 'hidden'
      }}
      className="relative py-20 sm:py-24 bg-gradient-to-br from-blue-900/5 via-purple-700/5 to-blue-900/5 overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div
        className="absolute top-[10%] left-[10%] w-36 h-36 rounded-full bg-gradient-radial from-blue-500/10 to-transparent animate-scale-rotate z-0"
      />
      
      <div
        className="absolute bottom-[15%] right-[5%] w-24 h-24 rounded-[30%] bg-gradient-to-br from-purple-500/5 to-blue-400/5 animate-xy-oscillate z-0"
      />

      <Container maxWidth="md" className="relative z-10 text-center">
        <div className="animate-fadeInUp">
          {/* Animated Icons */}
          <div className="flex justify-center gap-8 mb-8" style={{ marginBottom: '24px' }}>
            <div className="animate-xy-oscillate">
              <Box
                sx={{
                  width: { xs: 50, sm: 60 },
                  height: { xs: 50, sm: 60 },
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
                className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-md flex items-center justify-center"
              >
                <RocketLaunchIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: 'white' }} />
              </Box>
            </div>
            
            <div className="animate-xy-oscillate animate-delay-1000">
              <Box
                sx={{
                  width: { xs: 50, sm: 60 },
                  height: { xs: 50, sm: 60 },
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
                className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 shadow-md flex items-center justify-center"
              >
                <AutoAwesomeIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: 'white' }} />
              </Box>
            </div>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Ready to Start Learning?
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl max-w-xl mx-auto text-gray-300 mb-10 font-normal">
            Dive into a world of knowledge, challenge your friends, and track your progress.
            <span className="block mt-1 font-semibold text-purple-600">
              ReactiQuiz is here to make learning fun and effective.
            </span>
          </p>

          {/* Call to Action Button */}
          <div className="inline-block animate-fadeInUp animate-scale-up">
            <PulseButton
              size="large"
              startIcon={
                <div className="animate-spin">
                  <RocketLaunchIcon />
                </div>
              }
              onClick={() => navigate('/login')}
              className="py-3 px-6 text-lg font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
            >
              Get Started Now
            </PulseButton>
          </div>

          {/* Additional encouragement text */}
          <p className="text-gray-400 text-sm italic mt-6">
            🚀 Join thousands of learners already on their journey
          </p>
        </div>
      </Container>
    </Box>
  );
}

export default CallToActionSection;