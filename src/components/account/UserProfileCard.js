// src/components/account/UserProfileCard.js
import React from 'react';
import {
  Paper, Avatar, Typography, Divider, Stack, Box, Button, CircularProgress, Alert, useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventNoteIcon from '@mui/icons-material/EventNote';

const formatUserClassDisplay = (userClass) => {
  if (!userClass) return 'Class Not Set';
  const num = parseInt(userClass);
  if (isNaN(num)) return userClass;
  // Simple suffix logic
  if (num === 11 || num === 12 || num === 13) return `Class ${num}th`;
  const lastDigit = num % 10;
  switch (lastDigit) {
    case 1: return `Class ${num}st`;
    case 2: return `Class ${num}nd`;
    case 3: return `Class ${num}rd`;
    default: return `Class ${num}th`;
  }
};

function UserProfileCard({
  currentUser,
  userStats,
  isLoadingStats,
  statsError,
  onEditDetailsClick,
  onLogoutClick,
  accentColor
}) {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Avatar
        sx={{
          width: 100, height: 100,
          mb: 1.5,
          bgcolor: accentColor,
          fontSize: '3rem',
          color: theme.palette.getContrastText(accentColor),
        }}
        alt={currentUser?.name?.charAt(0).toUpperCase()}
      >
        {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
      </Avatar>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        {currentUser?.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
        {formatUserClassDisplay(currentUser?.class)}
      </Typography>
      <Divider sx={{ width: '90%', my: 1.5 }} />
      
      {isLoadingStats ? (
        <CircularProgress sx={{ my: 1.5, color: accentColor }} />
      ) : statsError ? (
        <Alert severity="error" sx={{ width: '100%', my: 1 }}>{statsError}</Alert>
      ) : (
        <Stack spacing={1.5} sx={{ width: '100%', alignItems: 'flex-start', px: 1, my: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssessmentIcon sx={{ color: 'text.secondary', mr: 1.5 }} />
            <Typography variant="body2">
              Average Score: <Typography component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{userStats.overallAveragePercentage}%</Typography>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EventNoteIcon sx={{ color: 'text.secondary', mr: 1.5 }} />
            <Typography variant="body2">
              Tests Solved: <Typography component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{userStats.totalQuizzesSolved}</Typography>
            </Typography>
          </Box>
        </Stack>
      )}

      <Button
        fullWidth
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={onEditDetailsClick}
        sx={{ mt: 3, borderColor: theme.palette.divider, color: 'text.primary', '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.08) } }}
      >
        Edit Profile
      </Button>
      <Button
        fullWidth
        variant="text"
        onClick={onLogoutClick}
        startIcon={<LogoutIcon />}
        sx={{ mt: 1, color: 'text.secondary' }}
      >
        Logout
      </Button>
    </Paper>
  );
}

export default UserProfileCard;