// src/pages/FlashcardPage.js
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShuffleIcon from '@mui/icons-material/Shuffle';

import { useFlashcards } from '../hooks/useFlashcards'; // <-- Import the new hook
import FlashcardViewer from '../components/flashcards/FlashcardViewer';
import { subjectAccentColors as themeSubjectAccentColors } from '../theme';

function FlashcardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Get all state and logic from the custom hook
  const {
    topicId,
    allQuestions,
    flashcards,
    currentCardIndex,
    isLoading,
    error,
    currentCardData,
    handleNextCard,
    handlePreviousCard,
    handleShuffleCards,
  } = useFlashcards();

  // Get presentation-related data from location state
  const pageState = location.state || {};
  const topicNameFromState = pageState.topicName || topicId.replace(/-/g, ' ');
  const subject = pageState.subject || 'default';
  const accentColor = pageState.accentColor || themeSubjectAccentColors[subject.toLowerCase()] || theme.palette.primary.main;


  // --- Render Logic ---

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: accentColor }} />
        <Typography sx={{ ml: 2 }}>Loading Flashcards...</Typography>
      </Box>
    );
  }

  if (error && allQuestions.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2, borderColor: accentColor, color: accentColor }}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!isLoading && allQuestions.length === 0 && !error) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Typography variant="h5">No Flashcards Available</Typography>
        <Typography>No questions were found for "{topicNameFromState}" to create flashcards.</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(subject ? `/subjects/${subject.toLowerCase()}` : '/subjects')}
          sx={{ mt: 2, borderColor: accentColor, color: accentColor }}
        >
          Back to {subject && subject !== 'default' ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Subject'} Topics
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '700px', margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{ color: accentColor, fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
        Flashcards: {topicNameFromState}
      </Typography>

      {error && flashcards.length > 0 &&
        <Alert severity="warning" sx={{ mb: 2, width: '100%' }}>{error}</Alert>
      }

      {currentCardData && (
        <FlashcardViewer
          currentCard={currentCardData}
          onNextCard={handleNextCard}
          onPreviousCard={handlePreviousCard}
          accentColor={accentColor}
          totalCards={flashcards.length}
          currentIndex={currentCardIndex}
        />
      )}

      {allQuestions.length > 1 && (
        <Button
          variant="text"
          onClick={handleShuffleCards}
          startIcon={<ShuffleIcon />}
          sx={{ color: accentColor, mt: 0.5, mb: 1.5 }}
          disabled={isLoading}
        >
          Shuffle Cards
        </Button>
      )}

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ width: '100%', mt: 1 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(subject ? `/subjects/${subject.toLowerCase()}` : '/subjects')}
          sx={{
            borderColor: accentColor,
            color: accentColor,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Back to {subject && subject !== 'default' ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Subject'} Topics
        </Button>
      </Stack>
    </Box>
  );
}

export default FlashcardPage;