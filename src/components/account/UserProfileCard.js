// src/components/account/UserProfileCard.js
import React from 'react';
import {
  Paper, Avatar, Typography, Divider, Stack, Box, Button, CircularProgress, Alert, useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventNoteIcon from '@mui/icons-material/EventNote';

// Helper to format class (can be moved to utils if used elsewhere)
const formatUserClassDisplay = (userClass) => {
  if (!userClass) return 'N/A';
  const num = parseInt(userClass);
  if (isNaN(num)) return userClass;
  if (num % 10 === 1 && num % 100 !== 11) return `Class ${num}st`;
  if (num % 10 === 2 && num % 100 !== 12) return `Class ${num}nd`;
  if (num % 10 === 3 && num % 100 !== 13) return `Class ${num}rd`;
  return `Class ${num}th`;
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
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  if (!currentUser) return null; // Should not happen if this component is rendered conditionally

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        borderTop: `4px solid ${effectiveAccentColor}`,
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: { xs: 0, sm: theme.shape.borderRadius }
      }}
    >
      <Avatar
        sx={{
          width: { xs: 100, sm: 120, md: 160 }, height: { xs: 100, sm: 120, md: 160 },
          mb: 1.5, bgcolor: effectiveAccentColor,
          fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
          color: theme.palette.getContrastText(effectiveAccentColor),
          border: `3px solid ${theme.palette.background.paper}`
        }}
        alt={currentUser.name ? currentUser.name.charAt(0).toUpperCase() : ''}
      >
        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <AccountCircleIcon fontSize="inherit" />}
      </Avatar>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', wordBreak: 'break-word', fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}>
        {currentUser.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: 'center', mb: 1.5, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
        {formatUserClassDisplay(currentUser.class)}
      </Typography>
      <Divider sx={{ width: '90%', my: 1.5 }} />
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1.5, px: 1, fontStyle: 'italic', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
        {currentUser.address || "No address provided."}
      </Typography>
      <Divider sx={{ width: '90%', my: 1.5 }} />
      {isLoadingStats ? (
        <CircularProgress sx={{ my: 1.5, color: effectiveAccentColor }} />
      ) : statsError ? (
        <Alert severity="error" sx={{ width: '100%', my: 1, fontSize: '0.8rem' }}>{statsError}</Alert>
      ) : (
        <Stack spacing={1} sx={{ width: '100%', alignItems: 'flex-start', px: 1, my: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssessmentIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: { xs: '1rem', sm: '1.125rem' } }} />
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Avg. Score: <Typography component="span" sx={{ fontWeight: 'bold', color: effectiveAccentColor, fontSize: 'inherit' }}>{userStats.overallAveragePercentage}%</Typography>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EventNoteIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: { xs: '1rem', sm: '1.125rem' } }} />
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Tests Solved: <Typography component="span" sx={{ fontWeight: 'bold', color: effectiveAccentColor, fontSize: 'inherit' }}>{userStats.totalQuizzesSolved}</Typography>
            </Typography>
          </Box>
        </Stack>
      )}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={onEditDetailsClick}
        sx={{ mt: 2, borderColor: effectiveAccentColor, color: effectiveAccentColor, '&:hover': { backgroundColor: alpha(effectiveAccentColor, 0.08) }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
      >
        Edit Profile Details
      </Button>
      <Button
        fullWidth
        variant="text"
        onClick={onLogoutClick}
        startIcon={<LogoutIcon />}
        sx={{ mt: 1, color: theme.palette.error.light, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
      >
        Logout
      </Button>
    </Paper>
  );
}

export default UserProfileCard;