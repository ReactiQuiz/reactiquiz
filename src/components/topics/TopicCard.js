// src/components/topics/TopicCard.js
import { Card, CardContent, Typography, CardActions, Stack, Chip, Divider, IconButton, Tooltip, useTheme } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StyleIcon from '@mui/icons-material/Style';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

function TopicCard({ topic, onStartQuiz, onStudyFlashcards, onPrintQuestions, accentColor }) {
  const theme = useTheme();

  // The accentColor is now received directly as a prop.
  // No need to call a hook here.

  return (
    <Card sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%', // Ensure card fills its Grid item parent
        borderTop: `4px solid ${accentColor}` 
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
        <Tooltip title="Start Quiz">
          <IconButton color="primary" onClick={onStartQuiz} sx={{ color: accentColor }}>
            <PlayCircleOutlineIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Study Flashcards">
          <IconButton onClick={onStudyFlashcards} sx={{ color: accentColor }}>
            <StyleIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Print Questions">
          <IconButton onClick={onPrintQuestions} sx={{ color: accentColor }}>
            <PictureAsPdfIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

export default TopicCard;