import React from 'react';
import { Box, Typography, Container, Paper, Divider, Link } from '@mui/material';

const ContactPage: React.FC = () => {
  return (
    <Box sx={{ py: { xs: 3, md: 5 }, width: '100%' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ backgroundColor: 'transparent', p: { xs: 1, sm: 2 } }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
            Contact Us
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Get in Touch
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              Have questions about ReactiQuiz? Need help with your account? Want to report a bug or suggest a feature? We're here to help!
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Contact Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Email Support
                </Typography>
                <Link href="mailto:support@reactiquiz.com" sx={{ fontSize: '1.1rem' }}>
                  support@reactiquiz.com
                </Link>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  For general inquiries, technical support, and feedback
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Business Inquiries
                </Typography>
                <Link href="mailto:business@reactiquiz.com" sx={{ fontSize: '1.1rem' }}>
                  business@reactiquiz.com
                </Link>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  For partnerships, collaborations, and business opportunities
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Website
                </Typography>
                <Link href="https://reactiquiz.web.app" target="_blank" rel="noopener" sx={{ fontSize: '1.1rem' }}>
                  https://reactiquiz.web.app
                </Link>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Response Time
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              We typically respond to all inquiries within 24-48 hours during business days. For urgent technical issues, please include "URGENT" in your subject line.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Frequently Asked Questions
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              Before contacting us, you might find answers to common questions in our FAQ section or by browsing through our help documentation.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 2 }}>
              Feedback & Suggestions
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              We value your feedback and suggestions for improving ReactiQuiz. If you have ideas for new features, improvements, or general feedback about your experience, please don't hesitate to reach out to us.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ContactPage;
