import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { mathematicsTopics } from './mathematicsTopics';
import TopicCard from '../../components/TopicCard'; // Adjust path if TopicCard is elsewhere

function MathematicsPage() {
  const handleStartQuiz = (topicId) => {
    // Placeholder for navigation or starting quiz logic
    console.log(`Start quiz for mathematics topic: ${topicId}`);
    // Example navigation using useNavigate hook:
    // navigate(`/mathematics/quiz/${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mathematics Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Mathematics quiz.
      </Typography>
      <Grid container spacing={3}>
        {mathematicsTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            onStartQuiz={handleStartQuiz}
            // subjectBasePath="/mathematics" // Optional: if TopicCard handles navigation
          />
        ))}
      </Grid>
    </Box>
  );
}

export default MathematicsPage;