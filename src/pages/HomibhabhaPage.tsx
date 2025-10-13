// src/pages/HomibhabhaPage.tsx
import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import EditNoteIcon from '@mui/icons-material/EditNote';

import { useHomibhabha } from '../hooks/useHomibhabha';
import PYQPapersModal from '../components/quiz/homibhabha/PYQPapersModal';
import PracticeTestModal from '../components/quiz/homibhabha/PracticeTestModal';
import HomiBhabhaCard from '../components/quiz/homibhabha/HomiBhabhaCard';

const HomibhabhaPage: React.FC = () => {
  const {
    pyqModalOpen,
    practiceTestModalOpen,
    homiBhabhaAccentColor,
    handleOpenPyqModal,
    handleClosePyqModal,
    handleStartPyqTest,
    handleOpenPracticeTestModal,
    handleClosePracticeTestModal,
    handleStartPracticeTest,
  } = useHomibhabha();

  return (
    <Box sx={{ p: 3, flexGrow: 1, width: '100%' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: homiBhabhaAccentColor,
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 4,
        }}
      >
        Homi Bhabha Practice Tests
      </Typography>

      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          mb: 4,
          color: 'text.secondary',
          maxWidth: '800px',
          mx: 'auto',
        }}
      >
        Prepare for competitive exams with our comprehensive Homi Bhabha practice tests. 
        Access previous year question papers and take practice tests to enhance your performance.
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <HomiBhabhaCard
            icon={<DescriptionIcon sx={{ fontSize: 60, color: homiBhabhaAccentColor, mb: 2 }} />}
            title="Previous Year Papers"
            description="Access and practice with actual previous year question papers from Homi Bhabha examinations."
            buttonText="View Papers"
            onClick={handleOpenPyqModal}
            accentColor={homiBhabhaAccentColor}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <HomiBhabhaCard
            icon={<EditNoteIcon sx={{ fontSize: 60, color: homiBhabhaAccentColor, mb: 2 }} />}
            title="Practice Tests"
            description="Take simulated practice tests with questions similar to the actual Homi Bhabha examination format."
            buttonText="Start Practice"
            onClick={handleOpenPracticeTestModal}
            accentColor={homiBhabhaAccentColor}
          />
        </Grid>
      </Grid>

      <PYQPapersModal
        open={pyqModalOpen}
        onClose={handleClosePyqModal}
        onStartTest={handleStartPyqTest}
        accentColor={homiBhabhaAccentColor}
      />

      <PracticeTestModal
        open={practiceTestModalOpen}
        onClose={handleClosePracticeTestModal}
        onStartTest={handleStartPracticeTest}
        accentColor={homiBhabhaAccentColor}
      />
    </Box>
  );
};

export default HomibhabhaPage;
