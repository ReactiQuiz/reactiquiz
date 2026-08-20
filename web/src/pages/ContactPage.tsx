// src/pages/ContactPage.tsx
/**
 * Contact Page
 *
 * Matched from Contact.dc.html: a two-column layout — a contact form on
 * the left, info cards (email, response time, "prefer to browse") on the
 * right. The mockup's own form has no real submit endpoint either (just a
 * simulated "sent" confirmation), so this mirrors that same level of
 * front-end-only behavior rather than fabricating a real submission API.
 */
import React, { useState, FormEvent } from 'react';
import { Box, Typography, Container, TextField, MenuItem, Button, Alert, Stack, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const SUBJECTS = ['General question', 'Report a bug', 'Account help', 'Feedback'];

const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <Box sx={{ py: { xs: 5, md: 7 }, width: '100%' }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(260px, 0.8fr)' }, gap: 4 }}>
          <Box>
            <Typography variant="overline" sx={{ bgcolor: 'primary.main', color: (t) => t.palette.getContrastText(t.palette.primary.main), px: 1.5, py: 0.5, borderRadius: 999, display: 'inline-block', mb: 2 }}>
              Contact
            </Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.6rem' }, mb: 1.5 }}>Get in touch</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, maxWidth: '46ch' }}>
              Questions about your account, a bug to report, or feedback on a quiz? Send us a message and we'll
              reply within a couple of days.
            </Typography>

            {sent && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 3 }}>Thanks — your message has been sent.</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 1, display: 'grid', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField label="Name" placeholder="your name" required />
                <TextField label="Email" type="email" placeholder="you@example.com" required />
              </Box>
              <TextField select label="Subject" defaultValue={SUBJECTS[0]}>
                {SUBJECTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField label="Message" placeholder="How can we help?" multiline minRows={4} required />
              <Button type="submit" variant="contained" size="large" fullWidth>Send message</Button>
            </Box>
          </Box>

          <Stack spacing={2.5} sx={{ alignContent: 'start' }}>
            <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 1 }}>
              <Typography variant="overline" color="text.secondary">Email</Typography>
              <Typography sx={{ mt: 0.5 }}>
                <MuiLink href="mailto:support@reactiquiz.app" sx={{ fontWeight: 600 }}>support@reactiquiz.app</MuiLink>
              </Typography>
            </Box>
            <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 1 }}>
              <Typography variant="overline" color="text.secondary">Response time</Typography>
              <Typography sx={{ mt: 0.5 }}>Usually within 2 business days.</Typography>
            </Box>
            <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 1 }}>
              <Typography variant="overline" color="text.secondary">Prefer to browse?</Typography>
              <Typography sx={{ mt: 0.5 }}>
                Check the <MuiLink component={RouterLink} to="/about-guest" sx={{ fontWeight: 600 }}>About page</MuiLink> or your{' '}
                <MuiLink component={RouterLink} to="/account" sx={{ fontWeight: 600 }}>account settings</MuiLink> first.
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactPage;
