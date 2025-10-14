// src/components/topics/TopicCard.tsx
import React from 'react';
import { Card, CardContent, Typography, CardActions, Stack, Chip, Divider, IconButton, Tooltip, useTheme } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StyleIcon from '@mui/icons-material/Style';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { Topic } from '../../types';

interface TopicCardProps {
  topic: Topic;
  onStartQuiz: () => void;
  onStudyFlashcards: () => void;
  onPrintQuestions: () => void;
  onGeneratePdf?: () => void;
  onStartTheory: () => void;
  accentColor: string;
}

const TopicCard: React.FC<TopicCardProps> = ({ 
  topic, 
  onStartQuiz, 
  onStudyFlashcards, 
  onPrintQuestions, 
  onGeneratePdf,
  onStartTheory, 
  accentColor 
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ 
        display: 'flex', flexDirection: 'column', height: '100%', width: '100%', 
        borderTop: `4px solid ${accentColor}`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[6],
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
        <Tooltip title="Generate PDF">
          <IconButton aria-label="Generate PDF" onClick={onGeneratePdf ?? onPrintQuestions} sx={{ color: accentColor }}>
            <PictureAsPdfIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Start Theory Paper">
          <IconButton aria-label="Start Theory Paper" onClick={onStartTheory} sx={{ color: accentColor }}>
            <EditNoteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default TopicCard;
