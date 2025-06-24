// src/components/challenges/IncomingChallengesList.js
import React from 'react';
import { Box, Typography, Paper, Grid, Button, CircularProgress, Alert, Chip, useTheme } from '@mui/material';
import { darken } from '@mui/material/styles';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
// import { formatTime } from '../../utils/formatTime'; // Removed if not used
import { subjectAccentColors as themeSubjectAccentColors } from '../../theme';

const formatChallengeTopicName = (topicName, quizClass, difficulty) => {
    let name = topicName || "Unknown Topic";
    if (quizClass) name += ` (Class ${quizClass})`;
    if (difficulty) name += ` - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
    return name;
};

function IncomingChallengesList({
  challenges,
  isLoading,
  error,
  onPlayChallenge,
  currentUserId,
  accentColor
}) {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.secondary.main;

  const renderChallengeItem = (challenge) => {
    // const opponentUsername = challenge.challenger_id === currentUserId // This wasn't used in the JSX
    //     ? challenge.challengedUsername
    //     : challenge.challengerUsername;

    let statusText = challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1);
    let statusColor = "default";
    let chipVariant = "filled";

    if (challenge.status === 'pending' || challenge.status === 'challenger_completed') {
        statusColor = "warning"; chipVariant = "outlined";
    }

    return (
      <Paper
        key={challenge.id}
        elevation={2}
        sx={{
          mb: 2, p: 2,
          borderLeft: `4px solid ${themeSubjectAccentColors[challenge.subject?.toLowerCase()] || theme.palette.grey[500]}`
        }}
      >
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
              {formatChallengeTopicName(challenge.topic_name, challenge.quiz_class, challenge.difficulty)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Challenged by: <strong>{challenge.challengerUsername || 'A user'}</strong>
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Received: {new Date(challenge.created_at).toLocaleDateString()}
              {challenge.expires_at && ` (Expires: ${new Date(challenge.expires_at).toLocaleDateString()})`}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} container direction="column" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.5}>
            <Grid item> <Chip label={statusText} color={statusColor} size="small" variant={chipVariant} /> </Grid>
            { (challenge.status === 'pending' || (challenge.status === 'challenger_completed' && challenge.challenged_id === currentUserId)) && (
              <Grid item sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SportsKabaddiIcon />}
                  onClick={() => onPlayChallenge(challenge)}
                  sx={{ backgroundColor: effectiveAccentColor, '&:hover': { backgroundColor: darken(effectiveAccentColor, 0.2) } }}
                >
                  Play Challenge
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  if (isLoading) {
    return <CircularProgress sx={{ color: effectiveAccentColor, display: 'block', mx: 'auto', my: 2 }} />;
  }
  if (error) {
    return <Alert severity="error" sx={{my: 2}}>{error}</Alert>;
  }
  if (challenges.length === 0) {
    return <Typography color="text.secondary" sx={{my: 2}}>No incoming challenges.</Typography>;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ color: effectiveAccentColor, opacity: 0.85 }}>
        Incoming Challenges
      </Typography>
      {challenges.map(challenge => renderChallengeItem(challenge))}
    </Box>
  );
}

export default IncomingChallengesList;