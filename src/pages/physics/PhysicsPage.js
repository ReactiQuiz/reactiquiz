import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { physicsTopics } from './physicsTopics';
import TopicCard from '../../components/TopicCard'; // Adjust path if TopicCard is elsewhere

function PhysicsPage() {
  const handleStartQuiz = (topicId) => {
    // Placeholder for navigation or starting quiz logic
    console.log(`Start quiz for physics topic: ${topicId}`);
    // Example navigation using useNavigate hook:
    // navigate(`/physics/quiz/${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Physics Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Physics quiz.
      </Typography>
      <Grid container spacing={3}>
        {physicsTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            onStartQuiz={handleStartQuiz}
            // subjectBasePath="/physics" // Optional: if TopicCard handles navigation
          />
        ))}
      </Grid>
    </Box>
  );
}

export default PhysicsPage;