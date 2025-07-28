// src/pages/AccountPage.js
import { Box, Paper, Grid, CircularProgress, Typography, useTheme, Stack } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

import { useAuth } from '../contexts/AuthContext';
import { useAccount } from '../hooks/useAccount';
import ChangeDetailsModal from '../components/auth/ChangeDetailsModal';
import UserProfileCard from '../components/account/UserProfileCard';
import AccountManagementActions from '../components/account/AccountManagementActions';
import UserActivityChart from '../components/account/UserActivityChart';

function AccountPage({ onOpenChangePasswordModal }) {
  const theme = useTheme();
  // --- START OF FIX: Use the correct function from the context ---
  const { currentUser, signOut, updateCurrentUserDetails } = useAuth();
  // --- END OF FIX ---
  const ACCENT_COLOR = theme.palette.accountAccent?.main || theme.palette.primary.main;

  const {
    userStats,
    isLoadingStats,
    statsError,
    changeDetailsModalOpen,
    handleOpenChangeDetailsModal,
    handleCloseChangeDetailsModal,
  } = useAccount();

  if (!currentUser) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{
        width: '100%',
        p: { xs: 1, sm: 2, md: 3 },
        margin: '0 auto',
        maxWidth: '1200px',
      }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={4} lg={3}>
            <UserProfileCard
              currentUser={currentUser}
              userStats={userStats}
              isLoadingStats={isLoadingStats}
              statsError={statsError}
              onEditDetailsClick={handleOpenChangeDetailsModal}
              onLogoutClick={signOut}
              accentColor={ACCENT_COLOR}
            />
          </Grid>
          <Grid item xs={12} md={8} lg={9}>
            <Stack spacing={{ xs: 2, md: 3 }} width={'100%'}>
              <AccountManagementActions
                onOpenChangePasswordModal={onOpenChangePasswordModal}
              />
              <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1, color: 'text.secondary' }} /> Quiz Activity (Last Year)
                </Typography>
                {isLoadingStats ? (
                  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress />
                  </Box>
                ) : statsError ? (
                   <Typography color="error" sx={{ textAlign: 'center', py: 5 }}>Could not load activity chart.</Typography>
                ) : userStats.activityData && userStats.activityData.length > 0 ? (
                  <UserActivityChart activityData={userStats.activityData} accentColor={ACCENT_COLOR} />
                ) : (
                  <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No quiz activity recorded yet.</Typography>
                  </Box>
                )}
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <ChangeDetailsModal
        open={changeDetailsModalOpen}
        onClose={handleCloseChangeDetailsModal}
        currentUser={currentUser}
        // --- START OF FIX: Pass the correct prop to the modal ---
        onUpdateSuccess={updateCurrentUserDetails}
        // --- END OF FIX ---
      />
    </>
  );
}

export default AccountPage;