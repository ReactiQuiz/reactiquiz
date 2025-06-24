// src/components/home/HeroSection.js
import React from 'react';
import { Box, Typography, Container, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

function HeroSection() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 6, sm: 8, md: 10 },
        textAlign: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)} 0%, ${alpha(theme.palette.secondary.dark, 0.8)} 100%)`,
        color: theme.palette.common.white,
        // mb: 6, // Margin bottom can be handled by parent or next section
        borderRadius: { sm: 2 }, // Optional: if you want rounded corners on larger screens
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }, letterSpacing: '-0.5px' }}
        >
          Welcome to ReactiQuiz!
        </Typography>
        <Typography
          variant="h5"
          component="p"
          sx={{ color: alpha(theme.palette.common.white, 0.85), fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
        >
          Sharpen Your Mind, One Quiz at a Time.
          <br />
          Explore, Learn, and Challenge Yourself.
        </Typography>
      </Container>
    </Box>
  );
}

export default HeroSection;