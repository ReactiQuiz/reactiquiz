// src/components/auth/AuthBrandingPanel.js
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function AuthBrandingPanel({ variant = 'login' }) {
  const theme = useTheme();

  const loginGradient = `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.secondary.dark, 0.9)} 100%)`;
  const registerGradient = `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0.95)} 0%, ${alpha(theme.palette.info.dark, 0.9)} 100%)`;

  const isLogin = variant === 'login';

  return (
    <Box sx={{
      height: '100%',
      p: 4,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      color: theme.palette.common.white,
      background: isLogin ? loginGradient : registerGradient,
    }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        ReactiQuiz
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
        {isLogin ? "Welcome Back!" : "Join the Community"}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1.5, maxWidth: '350px', color: alpha(theme.palette.common.white, 0.8) }}>
        {isLogin
          ? "Sign in to continue your learning journey, view your progress, and challenge your friends."
          : "Create an account to save your progress, compete with friends, and unlock your full potential."
        }
      </Typography>
    </Box>
  );
}

export default AuthBrandingPanel;