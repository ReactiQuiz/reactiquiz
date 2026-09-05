// src/components/flashcards/FlashcardItem.tsx
/**
 * Flashcard Item Component
 * 
 * This component displays a single flashcard with flip animation.
 * The card shows the question and options on the front, and the
 * correct answer and explanation on the back.
 */
import { useState } from 'react';
import { Paper, Typography, Box, useTheme, IconButton, List, ListItem, ListItemIcon, Divider, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FlipIcon from '@mui/icons-material/Flip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MarkdownRenderer from '../shared/MarkdownRenderer';

/**
 * Flashcard Item Component
 * 
 * Displays a single flashcard with:
 * - Front face: Question text and options
 * - Back face: Correct answer and explanation
 * - 3D flip animation (click to flip)
 * - Flip button
 * - Markdown rendering support
 * - Responsive styling
 * 
 * This component is used in FlashcardViewer to display individual
 * flashcards in a deck.
 * 
 * @param {Object} props - Component props
 * @param {string} props.frontText - Question text for the front of the card
 * @param {Array} props.options - Array of option objects with id and text
 * @param {string} props.correctOptionId - ID of the correct option
 * @param {string} props.explanation - Explanation text for the back
 * @param {string} props.frontTitle - Title for the front face
 * @param {string} props.backTitle - Title for the back face
 * @param {string} props.accentColor - Accent color for styling
 * @returns {JSX.Element} Flipable flashcard with question and answer
 */
function FlashcardItem({
  frontText, options, correctOptionId, explanation,
  frontTitle = "", backTitle = "Correct Answer", accentColor
}) {
  // Get theme for styling
  const theme = useTheme();
  // State for card flip
  const [isFlipped, setIsFlipped] = useState(false);

  // Use accent color or default to primary theme color
  const effectiveAccentColor = accentColor || theme.palette.primary.main;
  // Handle flip with event propagation stop
  const handleFlip = (e) => { e.stopPropagation(); setIsFlipped(!isFlipped); };

  // Find correct option object
  const correctOptionObject = options?.find(opt => opt.id === correctOptionId);
  // Format correct answer text
  const correctAnswerText = correctOptionObject ? `${correctOptionObject.id.toUpperCase()}. ${correctOptionObject.text}` : "Answer not available";

  // Process front text (replace \newline with actual newlines)
  const processedFrontText = frontText ? frontText.replace(/\\newline/g, '\n') : '';

  // Card minimum height for consistent display
  const cardMinHeight = '480px';

  const cardFaceStyles = {
    position: 'absolute', width: '100%', height: '100%',
    minHeight: cardMinHeight, backfaceVisibility: 'hidden',
    display: 'flex', flexDirection: 'column',
    p: { xs: 2, sm: 3 }, overflowY: 'auto',
    border: `2px solid ${effectiveAccentColor}`,
    borderRadius: '12px', boxSizing: 'border-box',
  };

  return (
    <Box 
      onClick={() => setIsFlipped(!isFlipped)} 
      sx={{ perspective: '1000px', width: '100%', minHeight: cardMinHeight, cursor: 'pointer', position: 'relative' }}
    >
      <Box
        sx={{
          position: 'relative', width: '100%', height: '100%',
          minHeight: cardMinHeight, transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Face */}
        <Paper elevation={3} sx={{ ...cardFaceStyles, justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'left' }}>
          <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%'}}>
            <Typography variant="h6" gutterBottom sx={{ color: effectiveAccentColor, fontWeight: 'bold', mb: 1.5, width: '100%', textAlign: 'center' }}>
              {frontTitle}
            </Typography>
            {/* --- START OF FIX: Increased font size --- */}
            <Box sx={{ mb: 2, width: '100%', whiteSpace: 'pre-wrap', flexGrow: 1, fontSize: '1.2rem' }}>
                <MarkdownRenderer text={processedFrontText} />
            </Box>
            {/* --- END OF FIX --- */}
            <Divider sx={{ width: '100%', my: 1 }} />
            <Typography variant="subtitle1" sx={{mb:1, fontWeight: 'medium'}}>Options:</Typography>
            <List dense sx={{ width: '100%', py: 0 }}>
              {options && options.map((option) => (
                <ListItem key={option.id} disablePadding sx={{mb: 0.5}}>
                  <Chip
                    label={<MarkdownRenderer text={`${option.id.toUpperCase()}. ${option.text}`} />}
                    variant="outlined"
                    sx={{ 
                      width: '100%', justifyContent: 'flex-start', py: 2, height: 'auto',
                      '& .MuiChip-label': { whiteSpace: 'normal', textAlign: 'left', lineHeight: '1.5', fontSize: '1rem' },
                      borderColor: alpha(effectiveAccentColor, 0.5) 
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>

        {/* Back Face */}
        <Paper elevation={3} sx={{ ...cardFaceStyles, transform: 'rotateY(180deg)', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <Typography variant="h6" gutterBottom sx={{ color: effectiveAccentColor, fontWeight: 'bold', mb: 2 }}>
              {backTitle}
            </Typography>
            <Box sx={{ p: 2, mb: 2, backgroundColor: alpha(theme.palette.success.main, 0.15), border: `1px solid ${theme.palette.success.main}`, borderRadius: 1, display: 'flex', alignItems: 'center', width: 'auto', minWidth: '60%', maxWidth: '95%', boxSizing: 'border-box' }}>
                <ListItemIcon sx={{minWidth: 'auto', mr: 1.5, color: theme.palette.success.main }}><CheckCircleIcon /></ListItemIcon>
                {/* --- START OF FIX: Increased font size --- */}
                <Box sx={{ fontWeight: 'medium', color: theme.palette.success.main, textAlign: 'left', fontSize: '1.2rem' }}>
                    <MarkdownRenderer text={correctAnswerText} />
                </Box>
                {/* --- END OF FIX --- */}
            </Box>
            {explanation && (
              <Box sx={{width: '100%', textAlign: 'left', mt: 1, flexGrow: 1, overflowY: 'auto', maxHeight: '150px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium'}}>Explanation:</Typography>
                <Box sx={{ color: 'text.secondary' }}>
                  <MarkdownRenderer text={explanation} />
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
      <Box sx={{ position: 'absolute', bottom: 12, right: 12, zIndex: 10 }}> 
        <IconButton onClick={handleFlip} aria-label="flip card" size="medium" sx={{ color: effectiveAccentColor, backgroundColor: alpha(theme.palette.background.default, 0.85), '&:hover': { backgroundColor: alpha(theme.palette.background.paper, 0.95), }, boxShadow: theme.shadows[2] }}>
          <FlipIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default FlashcardItem;