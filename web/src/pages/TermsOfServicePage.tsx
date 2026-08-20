// src/pages/TermsOfServicePage.tsx
/**
 * Terms of Service Page
 * 
 * This page displays the terms of service for ReactiQuiz, outlining
 * the rules and guidelines for using the platform.
 */
import React from 'react';
import { Box, Typography, Container, Paper, Divider } from '@mui/material';

/**
 * Terms of Service Page Component
 * 
 * Displays terms of service information with:
 * - Last updated date
 * - Acceptance of terms statement
 * - Use license details
 * - User account responsibilities
 * - Prohibited uses list
 * - Content guidelines
 * - Disclaimer information
 * - Contact information
 * - Responsive container layout
 * 
 * This page is accessible to both authenticated and guest users.
 * Required for legal compliance and user agreement.
 * 
 * @returns {JSX.Element} Terms of service page with legal information
 */
const TermsOfServicePage: React.FC = () => {
  return (
    <Box sx={{ py: { xs: 3, md: 5 }, width: '100%' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ backgroundColor: 'transparent', p: { xs: 1, sm: 2 } }}>
          <Typography variant="overline" sx={{ bgcolor: 'action.selected', color: 'text.secondary', px: 1.5, py: 0.5, borderRadius: 999, display: 'inline-block', mb: 2 }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.6rem' }, mb: 3 }}>
            Terms of Service
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Acceptance of Terms
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              By accessing and using ReactiQuiz, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Use License
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              Permission is granted to temporarily use ReactiQuiz for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </Typography>
            <Typography component="ul" sx={{ fontSize: '1.1rem', lineHeight: 1.7, pl: 3 }}>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              User Accounts
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Prohibited Uses
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              You may not use our service:
            </Typography>
            <Typography component="ul" sx={{ fontSize: '1.1rem', lineHeight: 1.7, pl: 3 }}>
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Content
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the service, including its legality, reliability, and appropriateness.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Disclaimer
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms relating to our website and the use of this website.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Contact Information
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              If you have any questions about these Terms of Service, please contact us at:
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

export default TermsOfServicePage;
