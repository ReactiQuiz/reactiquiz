// src/components/account/AccountPageSkeleton.js
import React from 'react';
import { Box, Grid, Skeleton, Stack } from '@mui/material';

function AccountPageSkeleton() {
  return (
    <Box sx={{
        width: '100%',
        p: { xs: 1, sm: 2, md: 3 },
        margin: '0 auto',
        maxWidth: '1200px',
      }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* === Left Column Skeleton === */}
        <Grid item xs={12} md={4} lg={3}>
          <Stack spacing={2} alignItems="center">
            <Skeleton variant="circular" width={100} height={100} />
            <Skeleton variant="text" width="80%" height={40} />
            <Skeleton variant="text" width="50%" height={20} />
            <Skeleton variant="rectangular" width="90%" height={100} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: 2 }} />
          </Stack>
        </Grid>

        {/* === Right Column Skeleton === */}
        <Grid item xs={12} md={8} lg={9}>
          <Stack spacing={{ xs: 2, md: 3 }} width={'100%'}>
            <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AccountPageSkeleton;