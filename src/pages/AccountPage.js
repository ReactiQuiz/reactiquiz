// src/pages/AccountPage.js
import { Box, Paper, Grid, CircularProgress, Alert, useTheme, Typography, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useAuth } from '../contexts/AuthContext';
import { useAccount } from '../hooks/useAccount'; // <-- Import our new hook

// Import Presentational Components
import ChangeDetailsModal from '../components/auth/ChangeDetailsModal';
import UserProfileCard from '../components/account/UserProfileCard';
import AccountManagementActions from '../components/account/AccountManagementActions';
import UserActivityChart from '../components/account/UserActivityChart';
import BarChartIcon from '@mui/icons-material/BarChart';

function AccountPage({ onOpenChangePasswordModal }) {
  const theme = useTheme();
  const { currentUser, logout, updateCurrentUserDetails } = useAuth(); // Get user and actions from AuthContext
  const ACCENT_COLOR = theme.palette.accountAccent?.main || theme.palette.primary.main;

  // Use the custom hook to get all state and logic for this page
  const {
    userStats,
    isLoadingStats,
    statsError,
    changeDetailsModalOpen,
    handleOpenChangeDetailsModal,
    handleCloseChangeDetailsModal,
  } = useAccount();

  // The main AccountPage component is now only responsible for rendering the UI.
  // It should not contain any direct data fetching or complex state logic.

  if (!currentUser) {
    // This case is primarily handled by ProtectedRoute, but as a fallback:
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading user...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{
        width: '100%',
        p: { xs: 1, sm: 1, md: 2, lg: 3 },
        backgroundColor: theme.palette.background.default,
        margin: '0 auto'
      }}>
        <Grid container>
          {/* === Left Column (Profile Info Card) === */}
          <Grid item sx={{
            width: { xs: '100%', sm: '100%', md: '24.5%', lg: '24.5%', xl: '24.5%' },
            marginLeft: { xs: '0%', sm: '0%', md: '0%', lg: '2%', xl: '2%' },
            paddingRight: { md: '1%', lg: '1%', xl: '1%' },
            marginBottom: { xs: 2, sm: 2, md: 0 }
          }}>
            <UserProfileCard
              currentUser={currentUser}
              userStats={userStats}
              isLoadingStats={isLoadingStats}
              statsError={statsError}
              onEditDetailsClick={handleOpenChangeDetailsModal}
              onLogoutClick={logout}
              accentColor={ACCENT_COLOR}
            />
          </Grid>

          {/* === Right Column (Account Management & Quiz Activity) === */}
          <Grid item sx={{
            width: { xs: '100%', sm: '100%', md: '74.5%', lg: '72.5%', xl: '72.5%' },
          }}>
            <Stack spacing={{ xs: 2, md: 3 }} width={'100%'}>
              <AccountManagementActions
                onOpenChangePasswordModal={onOpenChangePasswordModal}
                onOpenChangeDetailsModal={handleOpenChangeDetailsModal}
                accentColor={ACCENT_COLOR}
              />
              <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderTop: `3px solid ${theme.palette.info.main}`, width: '100%', boxSizing: 'border-box', borderRadius: { xs: 0, sm: theme.shape.borderRadius } }}>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.secondary, fontWeight: 'medium', display: 'flex', alignItems: 'center', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                  <BarChartIcon sx={{ mr: 1, color: theme.palette.info.light }} /> Quiz Activity (Last Year)
                </Typography>
                {isLoadingStats ? (
                  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress sx={{ color: theme.palette.info.main }} />
                  </Box>
                ) : statsError ? (
                  <Alert severity="warning" sx={{ mt: 1, fontSize: '0.8rem' }}>{`Could not load activity: ${statsError}`}</Alert>
                ) : userStats.activityData && userStats.activityData.length > 0 ? (
                  <UserActivityChart activityData={userStats.activityData} accentColor={ACCENT_COLOR} />
                ) : (
                  <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                    <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>No quiz activity recorded yet.</Typography>
                  </Box>
                )}
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* The ChangeDetailsModal now gets the user and the update function from the AuthContext */}
      <ChangeDetailsModal
        open={changeDetailsModalOpen}
        onClose={handleCloseChangeDetailsModal}
        currentUser={currentUser}
        setCurrentUser={updateCurrentUserDetails}
      />
    </>
  );
}

export default AccountPage;