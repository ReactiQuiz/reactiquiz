import React from 'react';
import { Box, Typography } from '@mui/material';
import { biologyTopics } from './biologyTopics';
import TopicCard from '../../components/TopicCard';

const BIOLOGY_ACCENT_COLOR = '#388e3c'; // Green 700

function BiologyPage() {
  const handleStartQuiz = (topicId) => {
    console.log(`Start quiz for biology topic: ${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: BIOLOGY_ACCENT_COLOR }} // Apply green color to the title
      >
        Biology Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Biology quiz.
      </Typography>
      <Box>
        {biologyTopics.map((topic) => (
          <Box key={topic.id} sx={{ mb: 2 }}>
            <TopicCard
              topic={topic}
              onStartQuiz={handleStartQuiz}
              accentColor={BIOLOGY_ACCENT_COLOR} // Pass the accent color
              subjectBasePath="biology"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default BiologyPage;
