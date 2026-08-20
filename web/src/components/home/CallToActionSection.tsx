// src/components/home/CallToActionSection.tsx
/**
 * Call To Action Section
 *
 * The closing "patch" panel matched from Landing.dc.html — an over-rounded,
 * tinted panel, not the previous dark radial-glow section with gradient text.
 */
import React from 'react';
import { Container, Box, Typography, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import LiquidGlassButton from '../animations/LiquidGlassButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function CallToActionSection() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <Box
            sx={{
              background: alpha(theme.palette.primary.main, 0.12),
              borderRadius: '48px',
              px: { xs: 3, sm: 6, md: 8 },
              py: { xs: 5, md: 7 },
            }}
          >
            <Typography variant="h2" sx={{ fontSize: { xs: '1.9rem', sm: '2.6rem' }, maxWidth: '16ch' }}>
              Ready to start learning?
            </Typography>
            <Typography variant="body1" sx={{ mt: 1.75, maxWidth: '60ch', color: 'text.secondary', fontSize: '1rem' }}>
              Create a free account and pick your first topic — your progress saves as you go.
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: 3.5, rowGap: 1.5 }}>
              <LiquidGlassButton variant="primary" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/register')}>
                Create your account
              </LiquidGlassButton>
              <LiquidGlassButton variant="default" size="large" onClick={() => navigate('/login')}>
                Log in
              </LiquidGlassButton>
            </Stack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

export default CallToActionSection;
