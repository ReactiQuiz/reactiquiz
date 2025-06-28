// src/pages/FriendsPage.js
import { Box, Typography, Paper, Divider, useTheme, Alert } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';

import { useFriends } from '../hooks/useFriends'; // <-- Import the new hook

// Import Presentational Components
import FriendSearch from '../components/friends/FriendSearch';
import PendingRequestsList from '../components/friends/PendingRequestsList';
import FriendsListDisplay from '../components/friends/FriendsListDisplay';
import DeleteConfirmationDialog from '../components/shared/DeleteConfirmationDialog';

function FriendsPage() {
  const theme = useTheme();
  const FRIENDS_ACCENT_COLOR = theme.palette.friendsAccent?.main || theme.palette.info.main;

  // Use the custom hook to get all state and logic
  const {
    friendsList,
    isLoadingFriends,
    friendsError,
    pendingRequests,
    isLoadingRequests,
    requestsError,
    responseMessage,
    unfriendConfirmationOpen,
    friendToUnfriend,
    handleRespondToRequest,
    openUnfriendConfirmation,
    closeUnfriendConfirmation,
    handleConfirmUnfriend,
  } = useFriends();

  return (
    <>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ color: FRIENDS_ACCENT_COLOR, fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
          <GroupIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.3em' }} />
          Manage Friends
        </Typography>

        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
          <FriendSearch accentColor={FRIENDS_ACCENT_COLOR} />
          
          <Divider sx={{ my: 3 }} />

          {responseMessage.text && <Alert severity={responseMessage.type} sx={{ mb: 2 }}>{responseMessage.text}</Alert>}
          
          <PendingRequestsList
            requests={pendingRequests}
            isLoading={isLoadingRequests}
            error={requestsError}
            onRespond={handleRespondToRequest}
            accentColor={FRIENDS_ACCENT_COLOR}
          />
          
          <Divider sx={{ my: 3 }} />
          
          <FriendsListDisplay
            friends={friendsList}
            isLoading={isLoadingFriends}
            error={friendsError}
            onUnfriend={openUnfriendConfirmation}
            accentColor={FRIENDS_ACCENT_COLOR}
          />
        </Paper>
      </Box>

      <DeleteConfirmationDialog
        open={unfriendConfirmationOpen}
        onClose={closeUnfriendConfirmation}
        onConfirm={handleConfirmUnfriend}
        title="Confirm Unfriend"
        message={`Are you sure you want to remove ${friendToUnfriend?.friendUsername} from your friends list? This action cannot be undone.`}
      />
    </>
  );
}

export default FriendsPage;