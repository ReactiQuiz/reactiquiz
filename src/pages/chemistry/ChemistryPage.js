// src/pages/chemistry/ChemistryPage.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { chemistryTopics } from './chemistryTopics';
import TopicCard from '../../components/TopicCard';

function ChemistryPage() {
  const handleStartQuiz = (topicId) => {
    console.log(`Start quiz for chemistry topic: ${topicId}`);
    // Future: navigate(`/chemistry/quiz/${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Chemistry Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Chemistry quiz.
      </Typography>
      <Box>
        {chemistryTopics.map((topic) => (
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

export default ChemistryPage;