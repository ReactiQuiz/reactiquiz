// --- START OF FILE src/pages/FlashcardPage.js ---

// src/pages/FlashcardPage.js
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, IconButton, Stack } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos';
import ShuffleIcon from '@mui/icons-material/Shuffle';
// QuizIcon and QuizSettingsModal are no longer needed here
import apiClient from '../api/axiosInstance';
import FlashcardItem from '../components/FlashcardItem';
import { subjectAccentColors as themeSubjectAccentColors } from '../theme';

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
  // const quizClassFromState = pageState.quizClass; // Not used for quiz initiation anymore
  const accentColor = pageState.accentColor || themeSubjectAccentColors[subject.toLowerCase()] || theme.palette.primary.main;

  const [allQuestions, setAllQuestions] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestionsForFlashcards = async () => {
      setIsLoading(true);
      setError('');
      try {
        // <<< CHANGE HERE: Using query parameter >>>
        const response = await apiClient.get(`/api/questions?topicId=${topicId}`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setAllQuestions(response.data);
          const formattedFlashcards = response.data.map(q => ({
            id: q.id,
            frontText: q.text,
            options: q.options,
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
     if (allQuestions.length > 0) {
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

  const currentCard = useMemo(() => {
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
            <Button variant="outlined" onClick={() => navigate(`/${subject}`)} sx={{ mt: 2, borderColor: accentColor, color: accentColor  }}>
              Back to {subject.charAt(0).toUpperCase() + subject.slice(1)} Topics
            </Button>
        </Box>
      );
  }

  return (
    <Box sx={{ p: {xs:1, sm:2, md:3}, maxWidth: '700px', margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{ color: accentColor, fontWeight: 'bold', textAlign: 'center', mb: 2 /* Increased margin slightly */ }}>
        Flashcards: {topicNameFromState}
      </Typography>
      {/* REMOVED: Typography for "Card X of Y (Click card to flip)" */}

      {error && flashcards.length > 0 &&
        <Alert severity="warning" sx={{mb: 2, width: '100%'}}>{error}</Alert>
      }

      {currentCard && (
        <Box sx={{ width: '100%', minHeight: '380px', perspective: '1000px', mb: 3 }}>
          <FlashcardItem
            frontText={currentCard.frontText}
            options={currentCard.options}
            correctOptionId={currentCard.correctOptionId}
            explanation={currentCard.explanation}
            accentColor={accentColor}
          />
        </Box>
      )}

      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ width: '100%', mb: 2 }}>
        <IconButton onClick={handlePreviousCard} aria-label="previous card" sx={{color: accentColor}} disabled={flashcards.length <= 1}>
          <ArrowBackIcon />
        </IconButton>
        <IconButton onClick={handleNextCard} aria-label="next card" sx={{color: accentColor}} disabled={flashcards.length <= 1}>
          <ArrowForwardIcon />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{width: '100%', mt: 1}}>
        <Button variant="outlined" onClick={() => navigate(`/${subject || ''}`)} sx={{ borderColor: accentColor, color: accentColor, width: {xs: '100%', sm: 'auto'} }}>
            Back to {subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Home'} Topics
        </Button>
      </Stack>
    </Box>
  );
}

export default FlashcardPage;

// --- END OF FILE src/pages/FlashcardPage.js ---