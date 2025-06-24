// src/pages/FlashcardPage.js
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, Stack } from '@mui/material'; // Removed IconButton
import { useTheme } from '@mui/material/styles'; // Removed alpha
// Removed ArrowBackIcon, ArrowForwardIcon, ShuffleIcon as they are in FlashcardViewer

import apiClient from '../api/axiosInstance';
// import FlashcardItem from '../components/FlashcardItem'; // No longer directly used here
import FlashcardViewer from '../components/flashcards/FlashcardViewer'; // <-- IMPORT NEW COMPONENT
import { subjectAccentColors as themeSubjectAccentColors } from '../theme';
import { parseQuestionOptions } from '../utils/quizUtils'; // Assuming you have this utility

// shuffleArray should ideally be in a utility file too
const shuffleArray = (array) => {
  if (!array || !Array.isArray(array)) return [];
  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function FlashcardPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const pageState = location.state || {};
  const topicNameFromState = pageState.topicName || topicId.replace(/-/g, ' ');
  const subject = pageState.subject || 'default';
  const accentColor = pageState.accentColor || themeSubjectAccentColors[subject.toLowerCase()] || theme.palette.primary.main;

  const [allQuestions, setAllQuestions] = useState([]); // Holds raw questions with parsed options
  const [flashcards, setFlashcards] = useState([]); // Holds the shuffled list of flashcard data objects
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestionsForFlashcards = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await apiClient.get(`/api/questions?topicId=${topicId}`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          const questionsWithParsedOptions = parseQuestionOptions(response.data);
          setAllQuestions(questionsWithParsedOptions); // Store all questions (for potential reshuffle)

          const formattedFlashcards = questionsWithParsedOptions.map(q => ({
            id: q.id,
            frontText: q.text,
            options: q.options, // Already an array
            correctOptionId: q.correctOptionId,
            explanation: q.explanation,
          }));
          setFlashcards(shuffleArray(formattedFlashcards));
          setCurrentCardIndex(0);
        } else {
          setError('No questions found for this topic to create flashcards.');
          setFlashcards([]);
          setAllQuestions([]);
        }
      } catch (err) {
        setError(`Failed to load questions: ${err.response?.data?.message || err.message}`);
        setFlashcards([]);
        setAllQuestions([]);
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
  }, [topicId]);

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
        const formattedFlashcards = allQuestions.map(q => ({
            id: q.id,
            frontText: q.text,
            options: q.options,
            correctOptionId: q.correctOptionId,
            explanation: q.explanation,
        }));
        setFlashcards(shuffleArray(formattedFlashcards));
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

  if (error && flashcards.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2, borderColor: accentColor, color: accentColor }}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!isLoading && flashcards.length === 0 && !error) {
      return (
        <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
            <Typography variant="h5">No Flashcards Available</Typography>
            <Typography>No questions were found for "{topicNameFromState}" to create flashcards.</Typography>
            <Button variant="outlined" onClick={() => navigate(subject ? `/subjects/${subject}` : '/subjects')} sx={{ mt: 2, borderColor: accentColor, color: accentColor  }}>
              Back to {subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Subject'} Topics
            </Button>
        </Box>
      );
  }

  return (
    <Box sx={{ p: {xs:1, sm:2, md:3}, maxWidth: '700px', margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{ color: accentColor, fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
        Flashcards: {topicNameFromState}
      </Typography>

      {error && flashcards.length > 0 && // Show warning if there's an error but we still have some cards
        <Alert severity="warning" sx={{mb: 2, width: '100%'}}>{error}</Alert>
      }

      {currentCardData && (
        <FlashcardViewer
          currentCard={currentCardData}
          onNextCard={handleNextCard}
          onPreviousCard={handlePreviousCard}
          // onShuffleCards={handleShuffleCards} // Uncomment if you bring back shuffle button in viewer
          accentColor={accentColor}
          totalCards={flashcards.length}
          currentIndex={currentCardIndex}
        />
      )}
      
      {/* Shuffle button can be here or inside FlashcardViewer */}
      {allQuestions.length > 1 && ( // Show shuffle if more than 1 card possible
         <Button
            variant="text"
            onClick={handleShuffleCards}
            // startIcon={<ShuffleIcon />} // If ShuffleIcon is imported here
            sx={{ color: accentColor, mt: 0.5, mb: 1.5 }}
        >
            Shuffle Cards
        </Button>
      )}


      <Stack direction="row" spacing={2} justifyContent="center" sx={{width: '100%', mt: 1}}>
        <Button variant="outlined" onClick={() => navigate(subject ? `/subjects/${subject}` : '/subjects')} sx={{ borderColor: accentColor, color: accentColor, width: {xs: '100%', sm: 'auto'} }}>
            Back to {subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Subject'} Topics
        </Button>
      </Stack>
    </Box>
  );
}

export default FlashcardPage;