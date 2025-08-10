// src/components/account/UserProfileCard.js
import React from 'react';
import {
  Paper, Avatar, Typography, Divider, Box, Button, useTheme, Stack, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const formatUserClassDisplay = (userClass) => {
  if (!userClass) return 'Class Not Set';
  const num = parseInt(userClass);
  if (isNaN(num)) return userClass;
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
  onEditDetailsClick,
  onLogoutClick,
  accentColor
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
      <Divider sx={{ width: '90%', mb: 2 }} />

      <Stack spacing={1} sx={{ width: '100%', alignItems: 'flex-start', mb: 2 }}>
        <ListItem disablePadding>
          <ListItemIcon sx={{ minWidth: '40px' }}>
            <EmailIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText primary={currentUser?.email || 'No email set'} />
        </ListItem>
        <ListItem disablePadding>
          <ListItemIcon sx={{ minWidth: '40px' }}>
            <PhoneIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText primary={currentUser?.phone || 'No phone number set'} />
        </ListItem>
      </Stack>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={onEditDetailsClick}
        sx={{ mb: 1, borderColor: theme.palette.divider, color: 'text.primary', '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.08) } }}
      >
        Edit Profile
      </Button>
      <Button
        fullWidth
        variant="text"
        onClick={onLogoutClick}
        startIcon={<LogoutIcon />}
        sx={{ color: 'text.secondary' }}
      >
        Logout
      </Button>
    </Paper>
  );
}

export default UserProfileCard;