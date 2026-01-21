// src/components/topics/TopicCard.tsx
/**
 * Topic Card Component
 * 
 * This component displays a topic card with topic information,
 * metadata chips, and action buttons for starting a quiz or
 * studying flashcards.
 */
import React from 'react';
import { Card, CardContent, Typography, CardActions, Stack, Chip, Divider, IconButton, Tooltip, useTheme } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StyleIcon from '@mui/icons-material/Style';
import { Topic } from '../../types';

/**
 * TopicCardProps Interface
 * 
 * Props for the TopicCard component.
 */
interface TopicCardProps {
  topic: Topic; // Topic object with name, description, class, genre, etc.
  onStartQuiz: () => void; // Callback to start quiz
  onStudyFlashcards: () => void; // Callback to study flashcards
  accentColor: string; // Accent color for styling
}

/**
 * Topic Card Component
 * 
 * Displays a topic card with:
 * - Topic name and description
 * - Metadata chips (class, genre)
 * - Action buttons (Start Quiz, Study Flashcards)
 * - Hover animations (lift effect)
 * - Accent color border
 * 
 * The card provides quick access to quiz and flashcard study modes
 * for a specific topic.
 * 
 * @param {TopicCardProps} props - Component props
 * @returns {JSX.Element} Topic card with actions
 */
const TopicCard: React.FC<TopicCardProps> = ({ 
  topic, 
  onStartQuiz, 
  onStudyFlashcards, 
  accentColor 
}) => {
  // Get theme for styling
  const theme = useTheme();

  return (
    <Card sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%', 
        borderTop: `4px solid ${accentColor}`, // Accent color border at top
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Smooth transitions
        '&:hover': {
          transform: 'translateY(-4px)', // Lift on hover
          boxShadow: theme.shadows[6], // Enhanced shadow on hover
        },
    }}>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: accentColor, mb: 1 }}>
          {topic.name}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
          {topic.class && <Chip label={`Class ${topic.class}`} size="small" />}
          {topic.genre && <Chip label={topic.genre} size="small" variant="outlined" />}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {topic.description}
        </Typography>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'space-around', p: 1 }}>
        <Tooltip title="Start MCQ Quiz">
          <IconButton aria-label="Start Quiz" onClick={onStartQuiz} sx={{ color: accentColor }}>
            <PlayCircleOutlineIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Study Flashcards">
          <IconButton aria-label="Study Flashcards" onClick={onStudyFlashcards} sx={{ color: accentColor }}>
            <StyleIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default TopicCard;
