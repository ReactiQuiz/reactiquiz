// src/components/home/AboutSummarySection.js
import React from 'react';
import { Container, Paper, Typography, useTheme, Box, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { darken } from '@mui/material/styles';

function AboutSummarySection() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ py: { xs: 4, sm: 6 } }}>
      <Container maxWidth="lg">
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            textAlign: 'center',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'medium', 
              color: theme.palette.text.primary, 
              fontSize: {xs: '1.5rem', sm: '2rem'} 
            }}
          >
            What is ReactiQuiz?
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: { xs: '0.9rem', sm: '1.05rem' }, 
              lineHeight: 1.7, 
              maxWidth: '800px', 
              margin: '0 auto', 
              color: theme.palette.text.secondary,
              mb: 3
            }}
          >
            ReactiQuiz is a dynamic and engaging quiz application designed to help users test and improve their knowledge across various subjects. Whether you're preparing for exams, looking to learn something new, or just want to challenge yourself, ReactiQuiz offers a rich and interactive experience.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/about')}
            sx={{
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: darken(theme.palette.primary.main, 0.2)
              }
            }}
          >
            Learn More About Us
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default AboutSummarySection;