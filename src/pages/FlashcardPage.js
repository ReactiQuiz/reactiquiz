// src/pages/FlashcardPage.js
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Alert, Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShuffleIcon from '@mui/icons-material/Shuffle'; // For the shuffle button

import apiClient from '../api/axiosInstance';
import FlashcardViewer from '../components/flashcards/FlashcardViewer'; // Assuming path is correct
import { subjectAccentColors as themeSubjectAccentColors } from '../theme';
import { parseQuestionOptions, shuffleArray } from '../utils/quizUtils'; // Import utilities

function FlashcardPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const pageState = location.state || {};
  const topicNameFromState = pageState.topicName || topicId.replace(/-/g, ' ');
  const subject = pageState.subject || 'default'; // e.g., 'physics', 'chemistry'
  const accentColor = pageState.accentColor || themeSubjectAccentColors[subject.toLowerCase()] || theme.palette.primary.main;

  const [allQuestions, setAllQuestions] = useState([]); // Holds raw questions with parsed options (source of truth)
  const [flashcards, setFlashcards] = useState([]); // Holds the currently displayed (possibly shuffled) list of flashcard data objects
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestionsForFlashcards = async () => {
      setIsLoading(true);
      setError('');
      setFlashcards([]); // Clear previous flashcards
      setAllQuestions([]); // Clear previous allQuestions
      setCurrentCardIndex(0);

      try {
        const response = await apiClient.get(`/api/questions?topicId=${topicId}`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          const questionsWithParsedOptions = parseQuestionOptions(response.data);
          setAllQuestions(questionsWithParsedOptions); // Store all questions (for potential reshuffle)

          // Format for flashcard structure
          const formattedForFlashcards = questionsWithParsedOptions.map(q => ({
            id: q.id,
            frontText: q.text,
            options: q.options, // Already an array due to parseQuestionOptions
            correctOptionId: q.correctOptionId,
            explanation: q.explanation,
          }));

          // Shuffle the formatted flashcards when they are first loaded
          setFlashcards(shuffleArray([...formattedForFlashcards])); // Use spread to shuffle a copy
        } else {
          setError('No questions found for this topic to create flashcards.');
        }
      } catch (err) {
        setError(`Failed to load questions: ${err.response?.data?.message || err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (topicId) {
      fetchQuestionsForFlashcards();
    } else {
      setError("Topic ID is missing.");
      setIsLoading(false);
    }
  }, [topicId]); // Re-fetch if topicId changes

  const handleNextCard = () => {
    if (flashcards.length > 0) {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }
  };

  const handlePreviousCard = () => {
    if (flashcards.length > 0) {
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    }
  };

  const handleShuffleCards = () => {
    if (allQuestions.length > 0) { // Use allQuestions (unshuffled but parsed)
      const formattedForFlashcards = allQuestions.map(q => ({
        id: q.id,
        frontText: q.text,
        options: q.options,
        correctOptionId: q.correctOptionId,
        explanation: q.explanation,
      }));
      setFlashcards(shuffleArray([...formattedForFlashcards])); // Shuffle a copy
      setCurrentCardIndex(0);
    }
  };

  const currentCardData = useMemo(() => {
    return flashcards.length > 0 ? flashcards[currentCardIndex] : null;
  }, [flashcards, currentCardIndex]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: accentColor }} />
        <Typography sx={{ ml: 2 }}>Loading Flashcards...</Typography>
      </Box>
    );
  }

  if (error && allQuestions.length === 0) { // Show error only if no questions could be loaded at all
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2, borderColor: accentColor, color: accentColor }}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!isLoading && allQuestions.length === 0 && !error) { // No questions found, but no fetch error
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

      {/* Display error as a warning if we have some cards but still encountered an issue (e.g., partial load) */}
      {error && flashcards.length > 0 &&
        <Alert severity="warning" sx={{ mb: 2, width: '100%' }}>{error}</Alert>
      }

      {currentCardData && flashcards.length > 0 && ( // Ensure flashcards array is not empty
        <FlashcardViewer
          currentCard={currentCardData}
          onNextCard={handleNextCard}
          onPreviousCard={handlePreviousCard}
          accentColor={accentColor}
          totalCards={flashcards.length}
          currentIndex={currentCardIndex}
        />
      )}

      {allQuestions.length > 1 && ( // Show shuffle if more than 1 card is available in the source
        <Button
          variant="text"
          onClick={handleShuffleCards}
          startIcon={<ShuffleIcon />}
          sx={{ color: accentColor, mt: 0.5, mb: 1.5 }}
          disabled={isLoading} // Disable while loading new set
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