// src/components/about/ContactFormSection.tsx
/**
 * Contact Form Section Component
 * 
 * This component displays a contact form section on the About page.
 * It includes form fields for name, email, and message with validation
 * and API integration for submitting contact requests.
 */
import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress, useTheme
} from '@mui/material';
import { darken } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import apiClient from '../../api/axiosInstance';

/**
 * ContactFormSectionProps Interface
 * 
 * Props for the ContactFormSection component.
 */
interface ContactFormSectionProps {
  recipientEmail: string; // Email address of the recipient
  accentColor?: string; // Optional accent color for styling
}

/**
 * FormStatus Interface
 * 
 * Status of the form submission.
 */
interface FormStatus {
  type: 'success' | 'error' | ''; // Status type
  message: string; // Status message
}

/**
 * Contact Form Section Component
 * 
 * Displays a contact form with:
 * - Name, email, and message input fields
 * - Form validation (required fields, email format)
 * - API integration for form submission
 * - Success/error status messages
 * - Loading state during submission
 * - Form reset on successful submission
 * 
 * This component is used on the AboutPage to allow users to
 * send contact messages.
 * 
 * @param {ContactFormSectionProps} props - Component props
 * @returns {JSX.Element} Contact form section with fields and validation
 */
const ContactFormSection: React.FC<ContactFormSectionProps> = ({ recipientEmail, accentColor }) => {
  // Get theme for styling
  const theme = useTheme();
  // Use accent color or default to warning theme color
  const effectiveAccentColor = accentColor || theme.palette.warning.main;

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  // Form submission status
  const [formStatus, setFormStatus] = useState<FormStatus>({ type: '', message: '' });
  // Loading state during form submission
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  /**
   * Handle Form Submit
   * 
   * Handles form submission with validation and API call.
   * Validates required fields and email format before submitting.
   */
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingForm(true);
    // Clear previous status
    setFormStatus({ type: '', message: '' });

    // Validate required fields
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
        setFormStatus({ type: 'error', message: 'Please fill in all required fields.'});
        setIsSubmittingForm(false);
        return;
    }
    // Validate email format
    if (!/\S+@\S+\.\S+/.test(formEmail)) {
        setFormStatus({ type: 'error', message: 'Please enter a valid email address.'});
        setIsSubmittingForm(false);
        return;
    }

    try {
      // Submit form data to API
      const response = await apiClient.post('/api/contact', {
        name: formName,
        email: formEmail,
        message: formMessage,
        recipientEmail: recipientEmail
      });
      // Show success message
      setFormStatus({ type: 'success', message: response.data.message || 'Message sent successfully!' });
      // Reset form fields
      setFormName('');
      setFormEmail('');
      setFormMessage('');
    } catch (error: any) {
      console.error("Contact form submission error:", error.response || error);
      // Show error message
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
};

export default ContactFormSection;