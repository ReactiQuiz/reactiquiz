import React from 'react';
import { Grid, Card, CardContent, CardActions, Button, Typography } from '@mui/material';

function TopicCard({ topic, onStartQuiz }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '1px solid white',
          backgroundColor: 'background.paper',
          // Optional hover effect (can be kept or removed)
          '&:hover': {
            boxShadow: (theme) => theme.shadows[4],
            // transform: 'scale(1.02)', // Keep if you like the zoom
            transition: 'box-shadow 0.2s ease-in-out', // Removed transform transition if zoom is removed
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            sx={{ textAlign: 'center', mb: 1.5 }}
          >
            {topic.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
            {topic.description}
          </Typography>
        </CardContent>
        <CardActions
          sx={{
            justifyContent: 'center',
            p: 1.5,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => onStartQuiz(topic.id)}
            sx={{
              width: '90%',
              fontWeight: 'bold', // --- MAKE BUTTON TEXT BOLD ---
              // py: 1, // Optional: for taller button
            }}
          >
            Start Quiz
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
}

export default TopicCard;