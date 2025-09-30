// src/components/dashboard/DashboardSkeleton.tsx
import React from 'react';
import { Box, Grid, Skeleton } from '@mui/material';

// A skeleton component that mimics the final layout for a smooth loading experience
const DashboardSkeleton: React.FC = () => (
  <Box sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 }, width: '100%' }}>
    <Skeleton variant="rectangular" height={90} sx={{ mb: 3, borderRadius: 2 }} />
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} /></Grid>
      <Grid item xs={12} md={7}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} /></Grid>
      <Grid item xs={12}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} /></Grid>
      <Grid item xs={12}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} /></Grid>
    </Grid>
  </Box>
);

export default DashboardSkeleton;
