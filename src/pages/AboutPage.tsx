// src/pages/AboutPage.tsx
import React from 'react';
import { Box, Typography, Paper, Container, Divider } from '@mui/material';
import CreatorProfile from '../components/about/CreatorProfile';

const AboutPage: React.FC = () => {
  return (
    <Box sx={{ py: { xs: 3, md: 5 }, width: '100%' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ backgroundColor: 'transparent', p: { xs: 1, sm: 2 } }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              About ReactiQuiz
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Sharpening Minds, One Quiz at a Time.
            </Typography>
          </Box>

          <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            ReactiQuiz is a dynamic and engaging quiz application designed to help students and enthusiasts test and improve their knowledge across various subjects. Built with modern web technologies, it aims to provide a seamless and enjoyable learning experience.
          </Typography>

          <CreatorProfile />

          <Box sx={{ my: 5 }}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 'medium', mb: 2 }}>Our Mission</Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'text.secondary' }}>
              Our mission is to provide a high-quality, ad-free, and user-friendly platform for learning and self-assessment. We strive to continuously improve ReactiQuiz by adding new features, more topics, and ensuring the accuracy of our content.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ my: 5 }}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 'medium', mb: 2 }}>Key Features</Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'text.secondary' }}>
              • Comprehensive quiz system with multiple difficulty levels<br />
              • Real-time performance tracking and analytics<br />
              • Homi Bhabha practice tests for competitive exam preparation<br />
              • Subjective paper assessment with AI-powered grading<br />
              • Responsive design that works on all devices<br />
              • Dark and light theme support<br />
              • PDF generation for offline study
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ my: 5 }}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 'medium', mb: 2 }}>Technology Stack</Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'text.secondary' }}>
              ReactiQuiz is built using modern web technologies including React, TypeScript, Material-UI, Node.js, Express.js, and Turso database. The application leverages Google Gemini AI for intelligent question generation and grading.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutPage;
