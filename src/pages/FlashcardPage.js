// src/pages/FlashcardPage.js
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, Stack } from '@mui/material';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { useFlashcards } from '../hooks/useFlashcards';
import FlashcardViewer from '../components/flashcards/FlashcardViewer';
// --- START OF FIX: Import the new hook ---
import { useSubjectColors } from '../contexts/SubjectColorsContext';
// --- END OF FIX ---

function FlashcardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    topicId, flashcards, currentCardIndex, isLoading, error,
    handleNextCard, handlePreviousCard, handleShuffleCards,
  } = useFlashcards();

  // --- START OF FIX: Get color dynamically from context ---
  const { getColor } = useSubjectColors();
  const pageState = location.state || {};
  const topicNameFromState = pageState.topicName || topicId.replace(/-/g, ' ');
  const subject = pageState.subject || 'default';
  const accentColor = getColor(subject);
  // --- END OF FIX ---

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: accentColor }} />
        <Typography sx={{ ml: 2 }}>Loading Flashcards...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2, borderColor: accentColor, color: accentColor }}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (flashcards.length === 0) {
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

      <FlashcardViewer
        currentCard={flashcards[currentCardIndex]}
        onNextCard={handleNextCard}
        onPreviousCard={handlePreviousCard}
        accentColor={accentColor}
        totalCards={flashcards.length}
        currentIndex={currentCardIndex}
      />

      {flashcards.length > 1 && (
        <Button
          variant="text"
          onClick={handleShuffleCards}
          startIcon={<ShuffleIcon />}
          sx={{ color: accentColor, mt: 0.5, mb: 1.5 }}
        >
          Shuffle Cards
        </Button>
      )}

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ width: '100%', mt: 1 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(subject ? `/subjects/${subject.toLowerCase()}` : '/subjects')}
          sx={{ borderColor: accentColor, color: accentColor, width: { xs: '100%', sm: 'auto' } }}
        >
          Back to Topics
        </Button>
      </Stack>
    </Box>
  );
}

export default FlashcardPage;