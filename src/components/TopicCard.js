// src/components/TopicCard.js
import React from 'react';
import { Card, CardContent, CardActions, Button, Typography } from '@mui/material'; // Removed Box as it's not strictly needed here now

function TopicCard({ topic, onStartQuiz }) {
  return (
    <Card
      sx={{
        border: '1px solid white',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        minHeight: { xs: 'auto', sm: '120px' }, // Adjusted minHeight for sm+
        '&:hover': {
          boxShadow: (theme) => theme.shadows[4],
          transition: 'box-shadow 0.2s ease-in-out',
        }
      }}
    >
      {/* Content Area (Title and Description) */}
      <CardContent
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          py: { xs: 1.5, sm: 2 },
          px: 2,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            textAlign: 'left',
            mb: 0.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {topic.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            textAlign: 'left',
            display: '-webkit-box',
            '-webkit-line-clamp': '2',
            '-webkit-box-orient': 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {topic.description}
        </Typography>
      </CardContent>

      {/* Actions Area (Button) */}
      <CardActions
        sx={{
          justifyContent: 'flex-start', // Align button to the left
          flexShrink: 0,
          width: { xs: '100%', sm: '25%' }, // Button area takes 25% on sm+
          p: { xs: 1.5, sm: 2 },
          pt: { xs: 1, sm: 2 }, // Adjusted top padding for xs
          // Center button vertically within this action area if CardActions height is more than button
          display: 'flex',
          alignItems: 'center', // Vertically center the button in this flex container
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => onStartQuiz(topic.id)}
          sx={{
            fontWeight: 'bold',
            width: '100%', // Button takes full width of its CardActions parent
            // On xs, CardActions is 100% wide, so button is 100% of that.
            // On sm+, CardActions is 25% wide, so button is 100% of that 25%.
          }}
        >
          Start Quiz
        </Button>
      </CardActions>
    </Card>
  );
}

export default TopicCard;