// src/pages/PrivacyPolicyPage.tsx
/**
 * Privacy Policy Page
 * 
 * This page displays the privacy policy for ReactiQuiz, explaining
 * how user data is collected, used, and protected.
 */
import React from 'react';
import { Box, Typography, Container, Paper, Divider } from '@mui/material';

/**
 * Privacy Policy Page Component
 * 
 * Displays privacy policy information with:
 * - Last updated date
 * - Introduction and commitment statement
 * - Information collection details
 * - Data usage explanations
 * - Third-party services disclosure (AdSense)
 * - Data security information
 * - Contact information
 * - Responsive container layout
 * 
 * This page is accessible to both authenticated and guest users.
 * Required for compliance with privacy regulations.
 * 
 * @returns {JSX.Element} Privacy policy page with legal information
 */
const PrivacyPolicyPage: React.FC = () => {
  return (
    <Box sx={{ py: { xs: 3, md: 5 }, width: '100%' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ backgroundColor: 'transparent', p: { xs: 1, sm: 2 } }}>
          <Typography variant="overline" sx={{ bgcolor: 'action.selected', color: 'text.secondary', px: 1.5, py: 0.5, borderRadius: 999, display: 'inline-block', mb: 2 }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.6rem' }, mb: 3 }}>
            Privacy Policy
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Introduction
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              ReactiQuiz ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational quiz platform.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Information We Collect
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              We collect information you provide directly to us, such as when you create an account, take quizzes, or contact us for support. This may include:
            </Typography>
            <Typography component="ul" sx={{ fontSize: '1.1rem', lineHeight: 1.7, pl: 3 }}>
              <li>Name and email address</li>
              <li>Quiz responses and performance data</li>
              <li>Account preferences and settings</li>
              <li>Communication records</li>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              How We Use Your Information
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              We use the information we collect to:
            </Typography>
            <Typography component="ul" sx={{ fontSize: '1.1rem', lineHeight: 1.7, pl: 3 }}>
              <li>Provide and maintain our educational services</li>
              <li>Track your learning progress and performance</li>
              <li>Improve our platform and develop new features</li>
              <li>Send you important updates about our services</li>
              <li>Respond to your inquiries and provide support</li>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Third-Party Services
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              We use Google AdSense to display advertisements on our platform. AdSense may use cookies and similar technologies to provide personalized ads based on your interests. You can opt out of personalized advertising by visiting Google's Ad Settings.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Data Security
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Contact Us
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              If you have any questions about this Privacy Policy, please contact us at:
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              Email: support@reactiquiz.com<br />
              Website: https://reactiquiz.web.app
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicyPage;
