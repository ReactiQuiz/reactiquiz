// src/components/FlashcardItem.js
import { useState } from 'react';
import {
  Paper, Typography, Box, useTheme, IconButton, List, ListItem, ListItemText, ListItemIcon, Divider, Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import FlipIcon from '@mui/icons-material/Flip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function FlashcardItem({
  frontText,
  options,
  correctOptionId,
  explanation,
  frontTitle = "", // Default changed as per your input
  backTitle = "Correct Answer",
  accentColor
}) {
  const theme = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);

  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  const handleFlip = (e) => {
    if (e) e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const correctOptionObject = options?.find(opt => opt.id === correctOptionId);
  const correctAnswerText = correctOptionObject ? `${correctOptionObject.id.toUpperCase()}. ${correctOptionObject.text}` : "Answer not available";

  // Define a fixed minimum height for the card faces
  const cardMinHeight = '380px'; // You can adjust this value as needed

  const cardFaceStyles = {
    position: 'absolute',
    width: '100%',
    height: '100%', // Faces should fill the flipper box
    minHeight: cardMinHeight, // Ensure faces have a minimum height
    backfaceVisibility: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    p: { xs: 2, sm: 3 },
    overflowY: 'auto',
    border: `2px solid ${effectiveAccentColor}`,
    borderRadius: theme.shape.borderRadius,
    boxSizing: 'border-box',
  };

  return (
    <Box 
      onClick={() => setIsFlipped(!isFlipped)} 
      sx={{ 
        perspective: '1000px', 
        width: '100%', 
        minHeight: cardMinHeight, // Outer container sets the minimum height for the whole component
        cursor: 'pointer',
        position: 'relative', 
      }}
    >
      <Box // The Flipper
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%', // Flipper takes 100% height of its parent (the Box above)
          minHeight: cardMinHeight, // Ensure flipper respects minHeight
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Face */}
        <Paper
          elevation={3}
          sx={{
            ...cardFaceStyles,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            textAlign: 'left',
          }}
        >
          <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%'}}>
            <Typography variant="h6" gutterBottom sx={{ color: effectiveAccentColor, fontWeight: 'bold', mb: 1.5, width: '100%', textAlign: 'center' }}>
              {frontTitle}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, width: '100%', whiteSpace: 'pre-wrap', flexGrow: 1 }}>
              {frontText}
            </Typography>
            <Divider sx={{ width: '100%', my: 1 }} />
            <Typography variant="subtitle1" sx={{mb:1, fontWeight: 'medium'}}>Options:</Typography>
            <List dense sx={{ width: '100%', py: 0 }}>
              {options && options.map((option) => (
                <ListItem key={option.id} disablePadding sx={{mb: 0.5}}>
                  <Chip
                    label={`${option.id.toUpperCase()}. ${option.text}`}
                    variant="outlined"
                    sx={{ 
                      width: '100%', 
                      justifyContent: 'flex-start', 
                      py: 1.5, 
                      height: 'auto', 
                      '& .MuiChip-label': { 
                          whiteSpace: 'normal', 
                          textAlign: 'left',
                          lineHeight: '1.4', 
                      },
                      borderColor: alpha(effectiveAccentColor, 0.5) 
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>

        {/* Back Face */}
        <Paper
          elevation={3}
          sx={{
            ...cardFaceStyles,
            transform: 'rotateY(180deg)',
            justifyContent: 'center', 
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <Typography variant="h6" gutterBottom sx={{ color: effectiveAccentColor, fontWeight: 'bold', mb: 2 }}>
              {backTitle}
            </Typography>
            <Box
                sx={{
                    p: 1.5, 
                    mb: 2,
                    backgroundColor: alpha(theme.palette.success.main, 0.15),
                    border: `1px solid ${theme.palette.success.main}`,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    width: 'auto', 
                    minWidth: '60%', 
                    maxWidth: '95%', 
                    boxSizing: 'border-box'
                }}
            >
                <ListItemIcon sx={{minWidth: 'auto', mr: 1, color: theme.palette.success.main }}> {/* CHANGED HERE */}
                    <CheckCircleIcon />
                </ListItemIcon>
                <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme.palette.success.main, whiteSpace: 'pre-wrap', textAlign: 'left' }}> {/* CHANGED HERE */}
                    {correctAnswerText}
                </Typography>
            </Box>

            {explanation && (
              <Box sx={{width: '100%', textAlign: 'left', mt: 1, flexGrow: 1, overflowY: 'auto', maxHeight: '150px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium'}}>Explanation:</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {explanation}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
      {/* Flip button */}
      <Box sx={{ position: 'absolute', bottom: 8, right: 8, zIndex: 10 }}> 
        <IconButton
          onClick={handleFlip}
          aria-label="flip card"
          size="medium" 
          sx={{ 
            color: effectiveAccentColor, 
            backgroundColor: alpha(theme.palette.background.default, 0.85), 
            '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
            },
            boxShadow: theme.shadows[2]
          }}
        >
          <FlipIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default FlashcardItem;