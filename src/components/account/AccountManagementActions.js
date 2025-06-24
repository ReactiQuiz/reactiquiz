// src/components/account/AccountManagementActions.js
import React from 'react';
import { Paper, Typography, Grid, Button, useTheme } from '@mui/material';
import { darken } from '@mui/material/styles';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Group';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import { useNavigate } from 'react-router-dom';

function AccountManagementActions({
  onOpenChangePasswordModal,
  onOpenChangeDetailsModal,
  accentColor // Main accent for some buttons
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        borderTop: `3px solid ${theme.palette.primary.main}`, // Or a different accent
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: { xs: 0, sm: theme.shape.borderRadius }
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.secondary, fontWeight: 'medium', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
        Account Management
      </Typography>
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <Button fullWidth variant="contained" startIcon={<VpnKeyIcon />} onClick={onOpenChangePasswordModal} sx={{ backgroundColor: effectiveAccentColor, '&:hover': { backgroundColor: darken(effectiveAccentColor, 0.2) }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Change Password
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button fullWidth variant="contained" startIcon={<SettingsIcon />} onClick={onOpenChangeDetailsModal} sx={{ backgroundColor: effectiveAccentColor, '&:hover': { backgroundColor: darken(effectiveAccentColor, 0.2) }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Change Profile Details
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button fullWidth variant="contained" startIcon={<GroupIcon />} onClick={() => navigate('/friends')} sx={{ backgroundColor: theme.palette.friendsAccent?.main, color: theme.palette.getContrastText(theme.palette.friendsAccent?.main), '&:hover': { backgroundColor: darken(theme.palette.friendsAccent?.main, 0.2) }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Manage Friends
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button fullWidth variant="contained" startIcon={<SportsKabaddiIcon />} onClick={() => navigate('/challenges')} sx={{ backgroundColor: theme.palette.challengesAccent?.main, color: theme.palette.getContrastText(theme.palette.challengesAccent?.main), '&:hover': { backgroundColor: darken(theme.palette.challengesAccent?.main, 0.2) }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            My Challenges
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default AccountManagementActions;