import React from 'react';
import { Box, Typography } from '@mui/material';
import { physicsTopics } from './physicsTopics';
import TopicCard from '../../components/TopicCard';

const PHYSICS_ACCENT_COLOR = '#1976d2'; // Blue 700

function PhysicsPage() {
  const handleStartQuiz = (topicId) => {
    console.log(`Start quiz for physics topic: ${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: PHYSICS_ACCENT_COLOR }} // Apply blue color to the title
      >
        Physics Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Physics quiz.
      </Typography>
      <Box>
        {physicsTopics.map((topic) => (
          <Box key={topic.id} sx={{ mb: 2 }}>
            <TopicCard
              topic={topic}
              onStartQuiz={handleStartQuiz}
              accentColor={PHYSICS_ACCENT_COLOR} // Pass the accent color
              subjectBasePath="physics"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default PhysicsPage;