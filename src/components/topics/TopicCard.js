// src/components/topics/TopicCard.js
import { Card, CardContent, Typography, CardActions, Stack, Chip, Divider, IconButton, Tooltip, useTheme } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StyleIcon from '@mui/icons-material/Style';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditNoteIcon from '@mui/icons-material/EditNote'; // <-- IMPORT NEW ICON

// --- START OF CHANGE: Add onStartTheory prop ---
function TopicCard({ topic, onStartQuiz, onStudyFlashcards, onPrintQuestions, onStartTheory, accentColor }) {
// --- END OF CHANGE ---
  const theme = useTheme();

  return (
    <Card sx={{ 
        display: 'flex', flexDirection: 'column', height: '100%', width: '100%', 
        borderTop: `4px solid ${accentColor}`,
        // --- START OF FIX: Added hover effect ---
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[6],
        },
        // --- END OF FIX ---
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
        <Tooltip title="Start MCQ Quiz"><IconButton onClick={onStartQuiz} sx={{ color: accentColor }}><PlayCircleOutlineIcon /></IconButton></Tooltip>
        {/* --- START OF CHANGE: Add new button --- */}
        <Tooltip title="Start Theory Paper"><IconButton onClick={onStartTheory} sx={{ color: accentColor }}><EditNoteIcon /></IconButton></Tooltip>
        {/* --- END OF CHANGE --- */}
        <Tooltip title="Study Flashcards"><IconButton onClick={onStudyFlashcards} sx={{ color: accentColor }}><StyleIcon /></IconButton></Tooltip>
        <Tooltip title="Print Questions"><IconButton onClick={onPrintQuestions} sx={{ color: accentColor }}><PictureAsPdfIcon /></IconButton></Tooltip>
      </CardActions>
    </Card>
  );
}

export default TopicCard;