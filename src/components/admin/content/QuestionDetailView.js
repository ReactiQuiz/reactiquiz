// src/components/admin/content/QuestionDetailView.js
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// This is a placeholder component that will be expanded later.
// For now, it satisfies the import and allows the app to build.
function QuestionDetailView({ topic, onBack }) {
  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to All Topics
      </Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Manage Questions for: {topic.name}
        </Typography>
        <Typography color="text.secondary">
          Full CRUD functionality for the questions in this topic will be implemented here in a future update.
        </Typography>
      </Paper>
    </Box>
  );
}

export default QuestionDetailView;