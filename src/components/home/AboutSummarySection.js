// src/components/home/AboutSummarySection.js
import React from 'react';
import { Container, Paper, Typography, useTheme, Box } from '@mui/material';

function AboutSummarySection() {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 4, sm: 6 } }}> {/* Added padding top/bottom */}
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium', color: theme.palette.primary.light, fontSize: {xs: '1.5rem', sm: '2rem'} }}>
            What is ReactiQuiz?
          </Typography>
          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1.05rem' }, lineHeight: 1.7, maxWidth: '750px', margin: '0 auto', color: theme.palette.text.secondary }}>
            ReactiQuiz is a dynamic and engaging quiz application designed to help users test and improve their knowledge across various subjects.
            Whether you're preparing for exams, looking to learn something new, or just want to challenge your friends, ReactiQuiz offers a rich and interactive experience.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default AboutSummarySection;