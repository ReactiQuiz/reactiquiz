import React from 'react';
import { Box, Typography } from '@mui/material';
// To use theme colors directly, you might import useTheme, but a hex code is simpler here.
// import { useTheme } from '@mui/material/styles';
import { chemistryTopics } from './chemistryTopics';
import TopicCard from '../../components/TopicCard';

const CHEMISTRY_ACCENT_COLOR = '#d32f2f'; // Define the red color

function ChemistryPage() {
  // const theme = useTheme(); // Example if you wanted to use theme.palette.error.main

  const handleStartQuiz = (topicId) => {
    console.log(`Start quiz for chemistry topic: ${topicId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: CHEMISTRY_ACCENT_COLOR }} // Apply red color to the title
      >
        Chemistry Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start your Chemistry quiz.
      </Typography>
      <Box>
        {chemistryTopics.map((topic) => (
          <Box key={topic.id} sx={{ mb: 2 }}>
            <TopicCard
              topic={topic}
              onStartQuiz={handleStartQuiz}
              accentColor={CHEMISTRY_ACCENT_COLOR} // Pass the accent color to TopicCard
              subjectBasePath="chemistry"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default ChemistryPage;