// src/pages/biology/BiologyPage.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { biologyTopics } from './biologyTopics';
import TopicCard from '../../components/TopicCard';

function BiologyPage() {
  const handleStartQuiz = (topicId) => {
    console.log(`Start quiz for biology topic: ${topicId}`);
    // Future: navigate(`/biology/quiz/${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Biology Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Biology quiz.
      </Typography>
      <Box>
        {biologyTopics.map((topic) => (
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

export default BiologyPage;