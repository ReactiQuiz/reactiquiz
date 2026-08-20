// src/pages/NotFoundPage.tsx
/**
 * Not Found Page (404)
 *
 * Matched from NotFound.dc.html: a tinted circle badge with "404", a
 * Caprasimo heading, and two actions (dashboard + home) instead of a
 * Paper card with a warning icon.
 */
import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 128px)',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: 480 }}>
        <Box
          sx={{
            position: 'relative', width: 140, height: 140, mx: 'auto', mb: 3,
            borderRadius: '50%', bgcolor: (t) => alpha(t.palette.primary.main, 0.14),
            display: 'grid', placeItems: 'center',
          }}
        >
          <Typography sx={{ fontFamily: 'inherit', fontSize: 48, color: 'primary.dark' }}>404</Typography>
        </Box>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, mb: 1.25 }}>
          This page wandered off
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3.5 }}>
          We can't find the page you're looking for. It may have been moved or the link may be incorrect.
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" sx={{ rowGap: 1.5 }}>
          <Button variant="contained" component={RouterLink} to="/dashboard">Back to dashboard</Button>
          <Button variant="outlined" component={RouterLink} to="/">Go to home</Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
