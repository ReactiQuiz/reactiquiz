import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { biologyTopics } from './biologyTopics'; // Import topics

function BiologyPage() {
  const handleStartQuiz = (topicId) => {
    console.log(`Start quiz for biology topic: ${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Biology Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Biology quiz.
      </Typography>
      <Grid container spacing={3}>
        {biologyTopics.map((topic) => (
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
                <Button
                  size="small"
                  onClick={() => handleStartQuiz(topic.id)}
                  // component={RouterLink}
                  // to={`/biology/quiz/${topic.id}`}
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

export default BiologyPage;