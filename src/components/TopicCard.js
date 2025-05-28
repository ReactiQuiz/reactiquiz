// src/components/TopicCard.js
import {
  Card, CardContent, Typography, Button, useTheme, alpha, Chip, Box
} from '@mui/material';

function TopicCard({ topic, onStartQuiz, accentColor }) {
  const theme = useTheme();
  const { name, description, class: topicClass, genre: topicGenre } = topic; // Destructure genre

  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  const cardStyle = {
    border: `1px solid ${alpha(effectiveAccentColor, 0.5)}`,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[2],
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[6],
    }
  };

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: effectiveAccentColor, flexGrow: 1 }}>
            {name}
          </Typography>
          <Box sx={{display: 'flex', gap: 0.5, alignItems: 'center'}}> {/* Wrapper for chips */}
            {topicClass && (
              <Chip label={`Class ${topicClass}`} size="small" sx={{ backgroundColor: alpha(theme.palette.info.dark, 0.2), color: theme.palette.info.light }} />
            )}
            {topicGenre && ( // Display genre chip if it exists
              <Chip label={topicGenre} size="small" sx={{ backgroundColor: alpha(theme.palette.success.dark, 0.2), color: theme.palette.success.light }} />
            )}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px' }}>
          {description}
        </Typography>
        <Button
          variant="outlined"
          onClick={onStartQuiz}
          sx={{
            borderColor: effectiveAccentColor,
            color: effectiveAccentColor,
            fontWeight: 'medium',
            '&:hover': {
              backgroundColor: alpha(effectiveAccentColor, 0.1),
              borderColor: effectiveAccentColor,
            },
          }}
        >
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
}

export default TopicCard;