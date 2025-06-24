// src/components/home/CallToActionSection.js
import React from 'react';
import { Box, Typography, Button, Container, useTheme } from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

function CallToActionSection() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ py: {xs:4, sm:6}, backgroundColor: alpha(theme.palette.background.paper, 0.7), textAlign: 'center' }}>
      <Container maxWidth="md">
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium', color: theme.palette.primary.light, fontSize: {xs: '1.5rem', sm: '2rem'} }}>
          Ready to Start Learning?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary, fontSize: {xs: '0.9rem', sm: '1rem'} }}>
          Dive into a world of knowledge, challenge your friends, and track your progress.
          ReactiQuiz is here to make learning fun and effective.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/account')} // Navigate to account page for login/register
          sx={{
            py: 1.5,
            px: {xs:3, sm:5},
            fontSize: {xs:'1rem', sm:'1.1rem'},
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: darken(theme.palette.primary.main, 0.2) }
          }}
        >
          Get Started Now
        </Button>
      </Container>
    </Box>
  );
}

export default CallToActionSection;