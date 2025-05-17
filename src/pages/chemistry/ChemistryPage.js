import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
// No longer need Card, CardContent, CardActions, Button directly here if TopicCard handles them
// import { Link as RouterLink } from 'react-router-dom'; // Only if parent page constructs link
import { chemistryTopics } from './chemistryTopics';
import TopicCard from '../../components/TopicCard'; // Adjust path if TopicCard is elsewhere

function ChemistryPage() {
  const handleStartQuiz = (topicId) => {
    // Placeholder for navigation or starting quiz logic
    console.log(`Start quiz for chemistry topic: ${topicId}`);
    // Example navigation using useNavigate hook (would be defined in this component):
    // navigate(`/chemistry/quiz/${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Chemistry Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Chemistry quiz.
      </Typography>
      <Grid container spacing={3}> {/* spacing between cards */}
        {chemistryTopics.map((topic) => (
          // The TopicCard component itself is a Grid item
          <TopicCard
            key={topic.id}
            topic={topic}
            onStartQuiz={handleStartQuiz}
            // subjectBasePath="/chemistry" // Pass if TopicCard handles navigation directly
          />
        ))}
      </Grid>
    </Box>
  );
}

export default ChemistryPage;