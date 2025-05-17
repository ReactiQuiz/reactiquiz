import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // For future navigation to specific quiz
import { chemistryTopics } from './chemistryTopics'; // Import topics

function ChemistryPage() {
  const handleStartQuiz = (topicId) => {
    // Placeholder for navigation or starting quiz logic
    console.log(`Start quiz for chemistry topic: ${topicId}`);
    // Example navigation: navigate(`/chemistry/quiz/${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Chemistry Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Chemistry quiz.
      </Typography>
      <Grid container spacing={3}>
        {chemistryTopics.map((topic) => (
          <Grid item xs={12} sm={6} md={4} key={topic.id}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                  {topic.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {topic.description}
                </Typography>
              </CardContent>
              <CardActions>
                {/* For now, this button logs to console. Later, it will navigate. */}
                <Button
                  size="small"
                  onClick={() => handleStartQuiz(topic.id)}
                  // Example for future routing with react-router-dom
                  // component={RouterLink}
                  // to={`/chemistry/quiz/${topic.id}`}
                >
                  Start Quiz
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ChemistryPage;