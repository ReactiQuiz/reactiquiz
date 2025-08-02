// src/components/auth/AuthBrandingPanel.js
import React from 'react';
import { Box, Typography, useTheme, Grid } from '@mui/material';
import { alpha } from '@mui/material/styles';

function AuthBrandingPanel({ variant = 'login' }) {
  const theme = useTheme();
  const isLogin = variant === 'login';

  // Define gradients for a modern look
  const loginGradient = `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.secondary.dark, 0.9)} 100%)`;
  const registerGradient = `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0.95)} 0%, ${alpha(theme.palette.info.dark, 0.9)} 100%)`;

  return (
    // This Grid item will be hidden on extra-small screens
    <Grid
      item
      xs={false}
      sm={4}
      md={7}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        p: 4,
        color: theme.palette.common.white,
        background: isLogin ? loginGradient : registerGradient,
      }}
    >
      <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        ReactiQuiz
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
        {isLogin ? "Welcome Back!" : "Join the Community"}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1.5, maxWidth: '400px', color: alpha(theme.palette.common.white, 0.85) }}>
        {isLogin
          ? "Sign in to continue your learning journey, view your progress, and challenge yourself."
          : "Create an account to save your progress, track your performance, and unlock your full potential."
        }
      </Typography>
    </Grid>
  );
}

export default AuthBrandingPanel;