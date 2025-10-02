// src/components/auth/AuthBrandingPanel.tsx
import React from 'react';
import { Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import SpaceBackground from '../animations/SpaceBackground';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

interface AuthBrandingPanelProps {
  variant?: 'login' | 'register';
}

function AuthBrandingPanel({ variant = 'login' }: AuthBrandingPanelProps) {
  const isLogin = variant === 'login';

  return (
    // This Grid item will be hidden on extra-small screens
    <Grid
      item
      xs={false}
      sm={false}
      md={7}
      sx={{
        position: 'relative',
        display: { xs: 'none', sm: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <SpaceBackground>
        <div className="flex flex-col items-center justify-center h-full px-8 relative z-10">
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 p-1 shadow-2xl">
                <div className="w-full h-full bg-slate-900/80 rounded-2xl flex items-center justify-center backdrop-blur">
                  {isLogin ? (
                    <LoginIcon sx={{ fontSize: 48, color: '#60a5fa' }} />
                  ) : (
                    <PersonAddIcon sx={{ fontSize: 48, color: '#8b5cf6' }} />
                  )}
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                {isLogin ? (
                  <AutoAwesomeIcon sx={{ fontSize: 20, color: 'white' }} />
                ) : (
                  <RocketLaunchIcon sx={{ fontSize: 20, color: 'white' }} />
                )}
              </div>
            </div>
          </motion.div>

          {/* Brand Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                background: 'linear-gradient(135deg, #ffffff 0%, #8b5cf6 50%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              ReactiQuiz
            </Typography>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                mb: 4,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                background: isLogin 
                  ? 'linear-gradient(135deg, #a78bfa, #60a5fa)' 
                  : 'linear-gradient(135deg, #34d399, #3b82f6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {isLogin ? "Welcome Back!" : "Join the Community"}
            </Typography>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                maxWidth: '500px',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.6,
                fontSize: { xs: '1rem', sm: '1.125rem' },
                fontWeight: 400,
              }}
            >
              {isLogin
                ? "Sign in to continue your learning journey, view your progress, and challenge yourself."
                : "Create an account to save your progress, track your performance, and unlock your full potential."
              }
            </Typography>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            className="flex items-center space-x-6 mt-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            {[
              { icon: AutoAwesomeIcon, delay: 0 },
              { icon: RocketLaunchIcon, delay: 0.1 },
              { icon: AutoAwesomeIcon, delay: 0.2 },
            ].map((item, index) => (
              <motion.div
                key={index}
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  delay: item.delay,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur border border-white/20 flex items-center justify-center"
              >
                <item.icon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SpaceBackground>
    </Grid>
  );
}

export default AuthBrandingPanel;