// src/components/topics/TopicCard.tsx
/**
 * Topic Card Component
 *
 * Displays a topic within a subject, styled with the subject's accent color inherited
 * from the database. Includes class/genre tag badges, description, and action buttons
 * for starting a quiz or studying flashcards.
 */
import React from 'react';
import { Card, CardContent, Typography, CardActions, Stack, Chip, Button, useTheme, alpha } from '@mui/material';
import { darken } from '@mui/material/styles';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StyleIcon from '@mui/icons-material/Style';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate } from 'react-router-dom';
import { Topic } from '../../types';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';

interface TopicCardProps {
  topic: Topic;
  onStartQuiz: () => void;
  onStudyFlashcards: () => void;
  onViewNotes?: () => void;
  accentColor?: string;
}

const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onStartQuiz,
  onStudyFlashcards,
  onViewNotes,
  accentColor: propAccentColor,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { getColor } = useSubjectColors();

  // Inherit color from prop or resolve directly from DB via subject_id / subjectKey
  const resolvedColor = propAccentColor || (topic.subject_id ? getColor(topic.subject_id) : '');
  const effectiveAccentColor = resolvedColor || theme.palette.primary.main;

  const handleNotesClick = () => {
    if (onViewNotes) {
      onViewNotes();
    } else {
      navigate(`/notes/${topic.id}`);
    }
  };

  return (
    <Card 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: alpha(effectiveAccentColor, 0.5),
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={0.75} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
          {topic.class && (
            <Chip 
              label={`Class ${topic.class}`} 
              size="small" 
              sx={{ 
                bgcolor: alpha(effectiveAccentColor, 0.12), 
                color: effectiveAccentColor, 
                fontWeight: 600,
                border: `1px solid ${alpha(effectiveAccentColor, 0.3)}` 
              }} 
            />
          )}
          {topic.genre && (
            <Chip 
              label={topic.genre} 
              size="small" 
              variant="outlined" 
            />
          )}
        </Stack>
        <Typography variant="h6" component="div" sx={{ fontSize: '1.1rem', mb: 0.5, fontWeight: 600 }}>
          {topic.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {topic.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<PlayCircleOutlineIcon />} 
          onClick={onStartQuiz} 
          sx={{ 
            flex: '1 1 100%',
            bgcolor: effectiveAccentColor,
            color: theme.palette.getContrastText(effectiveAccentColor),
            fontWeight: 700,
            '&:hover': {
              bgcolor: darken(effectiveAccentColor, 0.12),
            }
          }}
        >
          Start quiz
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<MenuBookIcon />} 
          onClick={handleNotesClick} 
          sx={{ 
            flex: 1,
            borderColor: alpha(effectiveAccentColor, 0.5),
            color: effectiveAccentColor,
            fontWeight: 600,
            '&:hover': {
              borderColor: effectiveAccentColor,
              bgcolor: alpha(effectiveAccentColor, 0.08),
            }
          }}
        >
          Notes
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<StyleIcon />} 
          onClick={onStudyFlashcards} 
          sx={{ 
            flex: 1,
            borderColor: alpha(effectiveAccentColor, 0.5),
            color: effectiveAccentColor,
            fontWeight: 600,
            '&:hover': {
              borderColor: effectiveAccentColor,
              bgcolor: alpha(effectiveAccentColor, 0.08),
            }
          }}
        >
          Cards
        </Button>
      </CardActions>
    </Card>
  );
};

export default TopicCard;
