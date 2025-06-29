// src/components/results/HistoricalResultsList.js
import React from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import HistoricalResultItem from './HistoricalResultItem';

function HistoricalResultsList({
  results,
  isLoading,
  error,
  deleteError,
  onDeleteClick,
  currentUser,
  accentColor
}) {
  const navigate = useNavigate();

  // The parent `ResultsPage` handles the main loading spinner.
  // This component can have its own checks for clarity.
  if (isLoading) {
    return null; // Parent shows the main loader
  }
  
  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  if (deleteError) {
    return <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>;
  }

  // If there are no results, show a helpful message.
  if (!results || results.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mt: 4, borderTop: `5px solid ${accentColor}` }}>
        <Typography variant="h6" gutterBottom>No Saved Results Found</Typography>
        <Typography sx={{mb: 2}}>You haven't completed any quizzes yet under this account.</Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/subjects')}
          sx={{ backgroundColor: accentColor, '&:hover': { backgroundColor: theme => theme.palette.augmentColor({color: {main: accentColor}}).dark } }}
        >
          Explore Quizzes
        </Button>
      </Paper>
    );
  }

  // If there are results, map over them and render each item.
  return (
    <Box sx={{ mt: 2 }}>
      {results.map((result) => (
        <HistoricalResultItem
          key={result.id}
          result={result}
          onDeleteClick={onDeleteClick}
          showDeleteButton={currentUser && currentUser.id === result.userId}
          isChallengeResult={!!result.challenge_id}
        />
      ))}
    </Box>
  );
}

export default HistoricalResultsList;