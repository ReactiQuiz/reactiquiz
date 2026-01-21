// src/components/flashcards/FlashcardViewer.tsx
/**
 * Flashcard Viewer Component
 * 
 * This component displays a flashcard viewer with navigation controls.
 * It shows the current flashcard and provides buttons to navigate
 * between cards in a deck.
 */
import React from 'react';
import { Box, IconButton, Stack, useTheme, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos';
import FlashcardItem from './FlashcardItem';

/**
 * Flashcard Viewer Component
 * 
 * Displays a flashcard viewer with:
 * - Current flashcard display
 * - Navigation buttons (Previous, Next)
 * - Card counter (current/total)
 * - Empty state handling
 * - Responsive layout
 * 
 * This component is used on the FlashcardsPage to display
 * flashcards from a deck with navigation.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.currentCard - Current flashcard object
 * @param {Function} props.onNextCard - Callback for next card button
 * @param {Function} props.onPreviousCard - Callback for previous card button
 * @param {string} props.accentColor - Accent color for styling
 * @param {number} props.totalCards - Total number of cards in the deck
 * @param {number} props.currentIndex - Current card index (0-based)
 * @returns {JSX.Element} Flashcard viewer with navigation controls
 */
function FlashcardViewer({
  currentCard,
  onNextCard,
  onPreviousCard,
  accentColor,
  totalCards,
  currentIndex
}) {
  // Get theme for styling
  const theme = useTheme();
  // Use accent color or default to primary theme color
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  // Handle empty state
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