// src/components/account/AccountManagementActions.js
import React from 'react';
import { Paper, Typography, Grid, Button, useTheme } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import GroupIcon from '@mui/icons-material/Group';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import { useNavigate } from 'react-router-dom';
import { darken } from '@mui/material/styles';

function AccountManagementActions({ onOpenChangePasswordModal }) {
  const theme = useTheme();
  const navigate = useNavigate();

  // --- START OF FIX: Add fallbacks for all theme colors ---
  const friendsColor = theme.palette.friendsAccent?.main || theme.palette.info.main;
  const challengesColor = theme.palette.challengesAccent?.main || theme.palette.secondary.main;
  // --- END OF FIX ---

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: `1px solid ${theme.palette.divider}`,
        width: '100%',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', mb: 2 }}>
        Account Management
      </Typography>
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <Button fullWidth variant="contained" startIcon={<VpnKeyIcon />} onClick={onOpenChangePasswordModal} sx={{ backgroundColor: 'primary.main' }}>
            Change Password
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<GroupIcon />} 
            onClick={() => navigate('/friends')} 
            // --- START OF FIX: Use the safe color variables ---
            sx={{ 
                backgroundColor: friendsColor, 
                color: theme.palette.getContrastText(friendsColor), 
                '&:hover': { backgroundColor: darken(friendsColor, 0.2) } 
            }}
            // --- END OF FIX ---
          >
            Manage Friends
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<SportsKabaddiIcon />} 
            onClick={() => navigate('/challenges')} 
            // --- START OF FIX: Use the safe color variables ---
            sx={{ 
                backgroundColor: challengesColor, 
                color: theme.palette.getContrastText(challengesColor), 
                '&:hover': { backgroundColor: darken(challengesColor, 0.2) } 
            }}
            // --- END OF FIX ---
          >
            My Challenges
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default AccountManagementActions;