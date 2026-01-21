// src/pages/AccountPage.tsx
/**
 * Account Page
 * 
 * This page displays the user's account information and provides
 * management options. It shows the user profile card, account
 * management actions, and modals for updating account details.
 */
import React from 'react';
import { Box, CircularProgress, Typography, useTheme, Stack } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useAccount } from '../hooks/useAccount';
import ChangeDetailsModal from '../components/auth/ChangeDetailsModal';
import UserProfileCard from '../components/account/UserProfileCard';
import AccountManagementActions from '../components/account/AccountManagementActions';

/**
 * AccountPageProps Interface
 * 
 * Props for the AccountPage component.
 */
interface AccountPageProps {
  onOpenChangePasswordModal?: () => void; // Callback to open change password modal
}

/**
 * Account Page Component
 * 
 * Displays the user account management interface with:
 * - User profile card (avatar, name, email, class, etc.)
 * - Account management action buttons
 * - Change details modal for updating account info
 * - Loading state during auth check
 * - Error state if user not found
 * - Responsive centered layout
 * 
 * This page is only accessible to authenticated users.
 * 
 * @param {AccountPageProps} props - Component props
 * @returns {JSX.Element} Account page with profile and management options
 */
const AccountPage: React.FC<AccountPageProps> = ({ onOpenChangePasswordModal }) => {
  const theme = useTheme();
  const { currentUser, signOut, updateCurrentUserDetails, isLoadingAuth } = useAuth();
  const ACCENT_COLOR = theme.palette.primary.main; // Using a consistent primary accent

  const {
    changeDetailsModalOpen,
    handleOpenChangeDetailsModal,
    handleCloseChangeDetailsModal,
  } = useAccount();

  if (isLoadingAuth) {
    // Show a skeleton while auth is loading, not the full page skeleton
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  if (!currentUser) {
    return (
       <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>User not found. Redirecting...</Typography>
       </Box>
    );
  }

  return (
    <>
      {/* This outer Box centers the content on the page */}
      <Box sx={{
        width: '100%',
        p: { xs: 1, sm: 2, md: 3 },
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
      }}>
        {/* The Stack arranges the profile card and management card vertically */}
        <Stack spacing={4} sx={{ width: '100%', maxWidth: '500px' }}>
          <UserProfileCard
            currentUser={currentUser}
            onEditDetailsClick={handleOpenChangeDetailsModal}
            onLogoutClick={signOut}
            accentColor={ACCENT_COLOR}
          />
          <AccountManagementActions
            onOpenChangePasswordModal={onOpenChangePasswordModal}
          />
        </Stack>
      </Box>

      <ChangeDetailsModal
        open={changeDetailsModalOpen}
        onClose={handleCloseChangeDetailsModal}
        currentUser={currentUser}
        onUpdateSuccess={updateCurrentUserDetails}
      />
    </>
  );
};

export default AccountPage;