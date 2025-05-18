// src/pages/mathematics/MathematicsPage.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { mathematicsTopics } from './mathematicsTopics';
import TopicCard from '../../components/TopicCard';

function MathematicsPage() {
  const handleStartQuiz = (topicId) => {
    console.log(`Start quiz for mathematics topic: ${topicId}`);
    // Future: navigate(`/mathematics/quiz/${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mathematics Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Mathematics quiz.
      </Typography>
      <Box>
        {mathematicsTopics.map((topic) => (
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

export default MathematicsPage;