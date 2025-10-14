// src/components/flashcards/FlashcardViewer.js
import React from 'react';
import { Box, IconButton, Stack, useTheme, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos';
// import ShuffleIcon from '@mui/icons-material/Shuffle';
import FlashcardItem from './FlashcardItem'; // <-- UPDATED IMPORT PATH

function FlashcardViewer({
  currentCard,
  onNextCard,
  onPreviousCard,
  accentColor,
  totalCards,
  currentIndex
}) {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  if (!currentCard) {
    return <Typography>No flashcard to display.</Typography>;
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
        Card {currentIndex + 1} of {totalCards} (Click card to flip)
      </Typography>
      <Box sx={{ width: '100%', minHeight: '380px', perspective: '1000px', mb: 2.5 }}>
        <FlashcardItem
          frontText={currentCard.frontText}
          options={currentCard.options}
          correctOptionId={currentCard.correctOptionId}
          explanation={currentCard.explanation}
          accentColor={effectiveAccentColor}
          frontTitle={`Question ${currentIndex + 1}`}
        />
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ width: '100%', mb: 1 }}>
        <IconButton
          onClick={onPreviousCard}
          aria-label="previous card"
          sx={{ color: effectiveAccentColor }}
          disabled={totalCards <= 1}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, minWidth: '60px', textAlign: 'center' }}>
          {currentIndex + 1} / {totalCards}
        </Typography>
        <IconButton
          onClick={onNextCard}
          aria-label="next card"
          sx={{ color: effectiveAccentColor }}
          disabled={totalCards <= 1}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default FlashcardViewer;