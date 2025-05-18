import React from 'react';
import { Card, CardContent, CardActions, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // <<< IMPORT useNavigate
import { lighten, useTheme } from '@mui/material/styles';

function TopicCard({ topic, onStartQuiz, accentColor = null, subjectBasePath }) { // Added subjectBasePath
  const navigate = useNavigate(); // <<< INITIALIZE useNavigate
  const theme = useTheme();

  const buttonStyles = accentColor
    ? {
        backgroundColor: accentColor,
        color: theme.palette.getContrastText(accentColor),
        '&:hover': {
          backgroundColor: lighten(accentColor, 0.15),
        },
      }
    : {};

  const handleStartQuizClick = () => {
    // Use the onStartQuiz prop IF IT'S JUST FOR LOGGING (as it was before)
    // OR directly navigate. For this step, let's navigate.
    // The onStartQuiz prop becomes less relevant if the card itself navigates.
    if (onStartQuiz) { // Keep for backward compatibility or other actions
        onStartQuiz(topic.id);
    }
    // Construct the path: e.g., /quiz/chemistry/periodic-table
    // subjectBasePath should be like 'chemistry', 'physics', etc.
    // topic.id is like 'periodic-table'
    navigate(`/quiz/${subjectBasePath}/${topic.id}`);
  };

  return (
    <Card
      sx={{
        border: accentColor ? `1px solid ${accentColor}` : '1px solid white',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        minHeight: { xs: 'auto', sm: '120px' },
        '&:hover': {
          boxShadow: (theme) => theme.shadows[4],
          transition: 'box-shadow 0.2s ease-in-out',
        }
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          py: { xs: 1.5, sm: 2 },
          px: 2,
        }}
      >
        <Typography /* ... title ... */ >{topic.name}</Typography>
        <Typography /* ... description ... */ >{topic.description}</Typography>
      </CardContent>
      <CardActions
        sx={{ /* ... styles ... */ }}
      >
        <Button
          variant="contained"
          color={accentColor ? undefined : "primary"}
          onClick={handleStartQuizClick} // <<< USE NEW HANDLER
          sx={{
            fontWeight: 'bold',
            width: '100%',
            ...buttonStyles,
          }}
        >
          Start Quiz
        </Button>
      </CardActions>
    </Card>
  );
}
// Ensure Typography for title and description have their full sx props from previous versions.
// For brevity, I've shortened them here.

export default TopicCard;