import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { biologyTopics } from './biologyTopics';
import TopicCard from '../../components/TopicCard'; // Adjust path if TopicCard is elsewhere

function BiologyPage() {
  const handleStartQuiz = (topicId) => {
    // Placeholder for navigation or starting quiz logic
    console.log(`Start quiz for biology topic: ${topicId}`);
    // Example navigation using useNavigate hook:
    // navigate(`/biology/quiz/${topicId}`);
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
          <TopicCard
            key={topic.id}
            topic={topic}
            onStartQuiz={handleStartQuiz}
            // subjectBasePath="/biology" // Optional: if TopicCard handles navigation
          />
        ))}
      </Grid>
    </Box>
  );
}

export default BiologyPage;