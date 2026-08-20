// src/components/auth/AuthBrandingPanel.tsx
/**
 * Auth Branding Panel
 *
 * The left-hand branding panel on login/register — Organic's sage-tinted
 * panel with soft decorative circles, matched from Login.dc.html. Replaces
 * the previous dark shader/glass panel, which hardcoded white text that
 * doesn't work on a light ground.
 */
import React from 'react';
import { Typography, Grid, Box, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthBrandingPanelProps {
  variant?: 'login' | 'register';
}

const FEATURES = [
  'Instant feedback on every quiz',
  'Progress tracked topic by topic',
  'An AI study partner, built in',
];

function AuthBrandingPanel({ variant = 'login' }: AuthBrandingPanelProps) {
  const theme = useTheme();
  const isLogin = variant === 'login';

  return (
    <Grid
      item
      xs={false}
      sm={false}
      md={7}
      sx={{
        position: 'relative',
        display: { xs: 'none', sm: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        background: alpha(theme.palette.secondary.main, 0.1),
        px: { md: 6, lg: 9 },
      }}
    >
      <Box aria-hidden sx={{ position: 'absolute', right: -120, top: -120, width: 340, height: 340, borderRadius: '50%', background: alpha(theme.palette.secondary.main, 0.18) }} />
      <Box aria-hidden sx={{ position: 'absolute', left: -80, bottom: -90, width: 240, height: 240, borderRadius: '50%', background: alpha(theme.palette.secondary.main, 0.26) }} />
      <Box aria-hidden sx={{ position: 'absolute', right: 40, bottom: 60, width: 90, height: 90, borderRadius: '50%', background: alpha(theme.palette.primary.main, 0.12) }} />

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
        <Typography
          component={RouterLink}
          to="/"
          sx={{ display: 'inline-block', fontFamily: 'inherit', fontWeight: 400, fontSize: 20, color: 'text.primary', textDecoration: 'none', mb: 5 }}
        >
          ReactiQuiz
        </Typography>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Typography variant="h1" sx={{ fontSize: { md: '2.6rem', lg: '3.5rem' } }}>
            {isLogin ? <>Welcome<br />back.</> : <>Join the<br />community.</>}
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <Typography variant="body1" sx={{ mt: 2.5, maxWidth: '42ch', color: 'text.secondary' }}>
            {isLogin
              ? 'Sign in to pick up where you left off — your subjects, your progress and your next quiz are all waiting for you.'
              : 'Create an account to save your progress, track your performance, and unlock your full potential.'}
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <Stack spacing={1.75} sx={{ mt: 4 }}>
            {FEATURES.map((f, i) => (
              <Stack key={f} direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, background: i % 2 === 0 ? 'primary.main' : 'secondary.main' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{f}</Typography>
              </Stack>
            ))}
          </Stack>
        </motion.div>
      </Box>
    </Grid>
  );
}

export default AuthBrandingPanel;
