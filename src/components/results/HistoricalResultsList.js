// src/components/results/HistoricalResultsList.js
import React from 'react';
import { Grid, Typography, Paper, Button, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HistoricalResultItem from './HistoricalResultItem';

function HistoricalResultsList({ results, isLoading, accentColor }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Grid container spacing={{ xs:"0%", sx:"1%", md:"1%", lg:"1%", xl:"1%" }}>
        {Array.from(new Array(4)).map((_, index) => (
          <Grid item key={index} width={{ xs: "100%", sm: "49.5%", md: "32.66%", lg: "24.25%", xl: "19.2%" }}>
            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2, width: '100%' }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mt: 4, borderTop: `5px solid ${accentColor}` }}>
        <Typography variant="h6" gutterBottom>No Saved Results Found</Typography>
        <Typography sx={{ mb: 2 }}>You haven't completed any quizzes yet.</Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/subjects')}
          sx={{ backgroundColor: accentColor }}
        >
          Explore Quizzes
        </Button>
      </Paper>
    );
  }

  return (
    <Grid container width="100%" spacing={{ xs:"0%", sx:"1%", md:"1%", lg:"1%", xl:"1%" }}>
      {results.map((result) => (
        <Grid item key={result.id} mb="2%" width={{ xs: "100%", sm: "49.5%", md: "32.66%", lg: "24.25%", xl: "19.2%" }}>
          <HistoricalResultItem result={result} />
        </Grid>
      ))}
    </Grid>
  );
}

export default HistoricalResultsList;