// src/pages/physics/PhysicsPage.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { physicsTopics } from './physicsTopics';
import TopicCard from '../../components/TopicCard';

function PhysicsPage() {
  const handleStartQuiz = (topicId) => {
    console.log(`Start quiz for physics topic: ${topicId}`);
    // Future: navigate(`/physics/quiz/${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Physics Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Physics quiz.
      </Typography>
      <Box>
        {physicsTopics.map((topic) => (
          <Box key={topic.id} sx={{ mb: 2 }}> {/* Wrapper Box for spacing */}
            <TopicCard
              topic={topic}
              onStartQuiz={handleStartQuiz}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default PhysicsPage;