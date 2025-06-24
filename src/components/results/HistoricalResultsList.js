// src/components/results/HistoricalResultsList.js
import React from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Button } from '@mui/material';
import HistoricalResultItem from './HistoricalResultItem'; // Assuming path
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom'; // For "Take a Quiz" button

function HistoricalResultsList({
  results,
  isLoading,
  error,
  deleteError, // Error specifically from delete operations
  onResultClick,
  onDeleteClick,
  currentUser, // To show user-specific messages
  accentColor
}) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: accentColor }} />
        <Typography sx={{ ml: 2 }}>Loading your results...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" variant="filled" sx={{ mb: 2 }}>{error}</Alert>;
  }
  if (deleteError) { // Display delete error if present
    return <Alert severity="error" variant="filled" sx={{ mb: 2 }}>{deleteError}</Alert>;
  }

  if (results.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderTop: `5px solid ${accentColor}` }}>
        <Typography variant="h6" gutterBottom>No Saved Results Found</Typography>
        <Typography>You haven't completed and saved any quizzes yet under this account.</Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/subjects')} // Navigate to explore subjects
          sx={{ mt: 2, backgroundColor: accentColor, '&:hover': { backgroundColor: theme => theme.palette.augmentColor({color: {main: accentColor}}).dark } }}
        >
          Explore Quizzes
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {results.map((result) => (
        <HistoricalResultItem
          key={result.id}
          result={result}
          onResultClick={onResultClick}
          onDeleteClick={onDeleteClick} // onDeleteClick passes result.id
          showDeleteButton={currentUser && currentUser.id === result.userId}
          isChallengeResult={!!result.challenge_id}
        />
      ))}
    </Box>
  );
}

export default HistoricalResultsList;