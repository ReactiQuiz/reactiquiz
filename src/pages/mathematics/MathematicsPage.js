import React from 'react';
import { Box, Typography } from '@mui/material';
import { mathematicsTopics } from './mathematicsTopics';
import TopicCard from '../../components/TopicCard';

const MATHEMATICS_ACCENT_COLOR = '#f57c00'; // Orange 700

function MathematicsPage() {
  const handleStartQuiz = (topicId) => {
    console.log(`Start quiz for mathematics topic: ${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: MATHEMATICS_ACCENT_COLOR }} // Apply orange color to the title
      >
        Mathematics Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Mathematics quiz.
      </Typography>
      <Box>
        {mathematicsTopics.map((topic) => (
          <Box key={topic.id} sx={{ mb: 2 }}>
            <TopicCard
              topic={topic}
              onStartQuiz={handleStartQuiz}
              accentColor={MATHEMATICS_ACCENT_COLOR} // Pass the accent color
              subjectBasePath="mathematics"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default MathematicsPage;