// src/components/TopicCard.js
import {
  Card, CardContent, Typography, Button, useTheme, alpha, Chip, Box, CardActions, Stack
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import StyleIcon from '@mui/icons-material/Style';

function TopicCard({ topic, onStartQuiz, onStudyFlashcards, accentColor }) {
  const theme = useTheme();
  const { name, description, class: topicClass, genre: topicGenre } = topic;

  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  const cardStyle = {
    border: `1px solid ${alpha(effectiveAccentColor, 0.5)}`,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[2],
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[6],
    },
    display: 'flex',
    flexDirection: 'column',
    height: '100%', // For equal height within a Grid row
    width: '100%'   // Explicitly set width to fill parent Grid item
  };

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: 2, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: effectiveAccentColor, flexGrow: 1, fontSize: '1.1rem' }}>
            {name}
          </Typography>
          <Box sx={{display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap'}}>
            {topicClass && (
              <Chip label={`Class ${topicClass}`} size="small" sx={{ backgroundColor: alpha(theme.palette.info.dark, 0.3), color: theme.palette.info.light, fontSize: '0.7rem' }} />
            )}
            {topicGenre && (
              <Chip label={topicGenre} size="small" sx={{ backgroundColor: alpha(theme.palette.success.dark, 0.2), color: theme.palette.success.light, fontSize: '0.7rem' }} />
            )}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: '3.2em', fontSize: '0.85rem' }}>
          {description}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 1.5, pt:0, alignSelf: 'stretch' }}>
        <Stack direction="row" spacing={1} sx={{width: '100%'}}>
            {onStartQuiz && (
                <Button
                    variant="outlined"
                    onClick={onStartQuiz}
                    fullWidth
                    startIcon={<SchoolIcon />}
                    sx={{
                        borderColor: effectiveAccentColor,
                        color: effectiveAccentColor,
                        fontWeight: 'medium',
                        py: 0.8,
                        fontSize: '0.875rem',
                        '&:hover': {
                        backgroundColor: alpha(effectiveAccentColor, 0.1),
                        borderColor: effectiveAccentColor,
                        },
                    }}
                >
                    Start Quiz
                </Button>
            )}
            {onStudyFlashcards && (
                 <Button
                    variant="outlined"
                    onClick={onStudyFlashcards}
                    fullWidth
                    startIcon={<StyleIcon />}
                    sx={{
                        borderColor: alpha(effectiveAccentColor, 0.7),
                        color: alpha(effectiveAccentColor, 0.9),
                        fontWeight: 'medium',
                        py: 0.8,
                        fontSize: '0.875rem',
                        '&:hover': {
                        backgroundColor: alpha(effectiveAccentColor, 0.05),
                        borderColor: effectiveAccentColor,
                        },
                    }}
                >
                    Flashcards
                </Button>
            )}
        </Stack>
      </CardActions>
    </Card>
  );
}

export default TopicCard;