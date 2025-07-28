// src/pages/AccountPage.js
import { Box, Paper, Grid, Typography, useTheme, Stack } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

import { useAuth } from '../contexts/AuthContext';
import { useAccount } from '../hooks/useAccount';
import ChangeDetailsModal from '../components/auth/ChangeDetailsModal';
import UserProfileCard from '../components/account/UserProfileCard';
import AccountManagementActions from '../components/account/AccountManagementActions';
import UserActivityChart from '../components/account/UserActivityChart';
// --- START OF FIX: Import the new skeleton component ---
import AccountPageSkeleton from '../components/account/AccountPageSkeleton';
// --- END OF FIX ---

function AccountPage({ onOpenChangePasswordModal }) {
  const theme = useTheme();
  const { currentUser, signOut, updateCurrentUserDetails, isLoadingAuth } = useAuth(); // Get isLoadingAuth
  const ACCENT_COLOR = theme.palette.accountAccent?.main || theme.palette.primary.main;

  const {
    userStats,
    isLoadingStats,
    statsError,
    changeDetailsModalOpen,
    handleOpenChangeDetailsModal,
    handleCloseChangeDetailsModal,
  } = useAccount();

  // --- START OF FIX: Implement the robust loading state check ---
  // Wait for BOTH authentication and account stats to finish loading
  if (isLoadingAuth || isLoadingStats) {
    return <AccountPageSkeleton />;
  }

  // This check is a fallback; ProtectedRoute should prevent this, but it adds resilience.
  if (!currentUser) {
    return (
       <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>User not found. Redirecting...</Typography>
       </Box>
    );
  }
  // --- END OF FIX ---

  return (
    <>
      <Box sx={{
        width: '100%',
        p: { xs: 1, sm: 2, md: 3 },
        margin: '0 auto',
        maxWidth: '1200px',
      }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* === Left Column (Profile Info Card) === */}
          <Grid item xs={12} md={4} lg={3}>
            <UserProfileCard
              currentUser={currentUser}
              userStats={userStats}
              isLoadingStats={isLoadingStats} // This prop is now somewhat redundant but harmless
              statsError={statsError}
              onEditDetailsClick={handleOpenChangeDetailsModal}
              onLogoutClick={signOut}
              accentColor={ACCENT_COLOR}
            />
          </Grid>

          {/* === Right Column (Account Management & Quiz Activity) === */}
          <Grid item xs={12} md={8} lg={9}>
            <Stack spacing={{ xs: 2, md: 3 }} width={'100%'}>
              <AccountManagementActions
                onOpenChangePasswordModal={onOpenChangePasswordModal}
              />
              <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1, color: 'text.secondary' }} /> Quiz Activity (Last Year)
                </Typography>
                {/* Now we know statsError or data will be ready */}
                {statsError ? (
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
        onUpdateSuccess={updateCurrentUserDetails}
      />
    </>
  );
}

export default AccountPage;