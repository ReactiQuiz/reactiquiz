// src/components/account/AccountManagementActions.tsx
/**
 * Account Management Actions Component
 * 
 * This component displays account management action buttons on the
 * Account page. Currently includes a "Change Password" button with
 * more actions available for future expansion.
 */
import React from 'react';
import { Paper, Typography, Grid, Button, useTheme } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

/**
 * AccountManagementActionsProps Interface
 * 
 * Props for the AccountManagementActions component.
 */
interface AccountManagementActionsProps {
  onOpenChangePasswordModal: () => void; // Callback to open change password modal
}

/**
 * Account Management Actions Component
 * 
 * Displays a card with account management actions:
 * - Change Password button
 * - Extensible grid layout for future actions
 * - Responsive styling
 * 
 * This component is used on the AccountPage to provide
 * account management functionality.
 * 
 * @param {AccountManagementActionsProps} props - Component props
 * @returns {JSX.Element} Account management actions card
 */
const AccountManagementActions: React.FC<AccountManagementActionsProps> = ({ onOpenChangePasswordModal }) => {
  // Get theme for styling
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
        <Grid item xs={12}>
          <Button fullWidth variant="contained" startIcon={<VpnKeyIcon />} onClick={onOpenChangePasswordModal} sx={{ backgroundColor: 'primary.main' }}>
            Change Password
          </Button>
        </Grid>
        {/* The other Grid items have been removed */}
      </Grid>
    </Paper>
  );
};

export default AccountManagementActions;
