// src/components/results/SubjectiveResultItem.js
import React from 'react';
import { Box, Paper, Typography, Chip, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GradingIcon from '@mui/icons-material/Grading';
import PendingIcon from '@mui/icons-material/Pending';
import { formatDate } from '../../utils/formatTime';

function SubjectiveResultItem({ result }) {
  const navigate = useNavigate();
  const isPending = result.grading_status === 'pending';

  const handleViewDetails = () => {
    navigate(`/subjective-result/${result.id}`);
  };

  return (
    <Paper 
      elevation={1} 
      sx={{
        p: 2,
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }} title={result.topicName}>
          {result.topicName}
        </Typography>
        {isPending ? (
          <Chip 
            icon={<PendingIcon />} 
            label="Grading" 
            color="warning" 
            size="small" 
            sx={{ fontWeight: 'medium' }} 
          />
        ) : (
          <Chip 
            icon={<GradingIcon />} 
            label={`${result.total_marks_awarded}/${result.total_max_marks}`} 
            color="primary" 
            size="small" 
            sx={{ fontWeight: 'medium' }} 
          />
        )}
      </Box>

      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <AccessTimeIcon sx={{ fontSize: '0.9rem', mr: 0.5, verticalAlign: 'text-top' }} />
          {formatDate(result.timestamp)}
        </Typography>
        {result.class && (
          <Typography variant="body2" color="text.secondary">
            Class: {result.class}
          </Typography>
        )}
        {result.genre && (
          <Typography variant="body2" color="text.secondary">
            Genre: {result.genre}
          </Typography>
        )}
      </Stack>

      {isPending && (
        <Typography variant="body2" color="warning.main" sx={{ mb: 2, fontStyle: 'italic' }}>
          Your answers are being graded. Check back soon for results.
        </Typography>
      )}

      <Button 
        variant="outlined" 
        fullWidth 
        onClick={handleViewDetails}
        sx={{ mt: 1 }}
      >
        View Details
      </Button>
    </Paper>
  );
}

export default SubjectiveResultItem;