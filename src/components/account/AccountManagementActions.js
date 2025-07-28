// src/components/account/AccountManagementActions.js
import React from 'react';
import { Paper, Typography, Grid, Button, useTheme } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

function AccountManagementActions({ onOpenChangePasswordModal }) {
  const theme = useTheme();

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
        {/* The other Grid items have been removed */}
      </Grid>
    </Paper>
  );
}

export default AccountManagementActions;