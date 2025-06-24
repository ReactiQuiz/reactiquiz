// src/components/about/ContactFormSection.js
import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress, useTheme
} from '@mui/material';
import { darken } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import apiClient from '../../api/axiosInstance'; // Adjust path

function ContactFormSection({ recipientEmail, accentColor }) {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.warning.main;

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsSubmittingForm(true);
    setFormStatus({ type: '', message: '' });

    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
        setFormStatus({ type: 'error', message: 'Please fill in all required fields.'});
        setIsSubmittingForm(false);
        return;
    }
    if (!/\S+@\S+\.\S+/.test(formEmail)) {
        setFormStatus({ type: 'error', message: 'Please enter a valid email address.'});
        setIsSubmittingForm(false);
        return;
    }


    try {
      const response = await apiClient.post('/api/contact', {
        name: formName,
        email: formEmail,
        message: formMessage,
        recipientEmail: recipientEmail
      });
      setFormStatus({ type: 'success', message: response.data.message || 'Message sent successfully!' });
      setFormName('');
      setFormEmail('');
      setFormMessage('');
    } catch (error) {
      console.error("Contact form submission error:", error.response || error);
      setFormStatus({ type: 'error', message: error.response?.data?.message || 'Failed to send message. Please try again later or use the direct email link.' });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', color: effectiveAccentColor, opacity: 0.85, mt: 3 }}>
        Contact Us
      </Typography>
      <Typography variant="body1" paragraph>
        Have questions or feedback? Fill out the form below, and we'll get back to you as soon as possible.
      </Typography>
      <Box component="form" onSubmit={handleFormSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Your Name"
          name="name"
          autoComplete="name"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Your Email Address"
          name="email"
          autoComplete="email"
          type="email"
          value={formEmail}
          onChange={(e) => setFormEmail(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="message"
          label="Your Message"
          id="message"
          multiline
          rows={4}
          value={formMessage}
          onChange={(e) => setFormMessage(e.target.value)}
        />
        {formStatus.message && (
          <Alert severity={formStatus.type === 'success' ? 'success' : 'error'} sx={{ mt: 2 }}>
            {formStatus.message}
          </Alert>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmittingForm}
          sx={{
            mt: 3, mb: 2,
            backgroundColor: effectiveAccentColor,
            color: theme.palette.getContrastText(effectiveAccentColor),
            '&:hover': { backgroundColor: darken(effectiveAccentColor, 0.15) }
          }}
          startIcon={isSubmittingForm ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        >
          {isSubmittingForm ? 'Sending...' : 'Send Message'}
        </Button>
      </Box>
    </Box>
  );
}

export default ContactFormSection;