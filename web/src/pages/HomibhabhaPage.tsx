// src/pages/HomibhabhaPage.tsx
/**
 * Homi Bhabha Page
 * 
 * This page provides access to Homi Bhabha competitive exam preparation.
 * It offers two options: Previous Year Question (PYQ) papers and
 * practice tests with configurable difficulty levels.
 */
import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import EditNoteIcon from '@mui/icons-material/EditNote';

import { useHomibhabha } from '../hooks/useHomibhabha';
import PYQPapersModal from '../components/quiz/homibhabha/PYQPapersModal';
import PracticeTestModal from '../components/quiz/homibhabha/PracticeTestModal';
import HomiBhabhaCard from '../components/quiz/homibhabha/HomiBhabhaCard';

/**
 * Homi Bhabha Page Component
 * 
 * Displays Homi Bhabha exam preparation options with:
 * - Page title and description
 * - PYQ (Previous Year Questions) card with modal
 * - Practice Test card with modal
 * - Modal dialogs for quiz configuration
 * - Class and year selection (for PYQ)
 * - Difficulty selection (for practice tests)
 * - Quiz session creation and navigation
 * - Subject-themed accent colors
 * 
 * This page is accessible to both authenticated and guest users.
 * Quiz functionality requires authentication.
 * 
 * @returns {JSX.Element} Homi Bhabha page with exam preparation options
 */
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
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      <Typography color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 13.5 }}>
        <RouterLink to="/subjects" style={{ color: 'inherit', textDecoration: 'none' }}>Subjects</RouterLink>
        <span>&rsaquo;</span>
        <Typography component="span" sx={{ color: homiBhabhaAccentColor, fontWeight: 600, fontSize: 'inherit' }}>Homi Bhabha</Typography>
      </Typography>

      <Typography variant="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem' }, mb: 1 }}>
        Homi Bhabha Bal Vaigyanik Spardha
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: '62ch' }}>
        Mock tests and topic-wise drills for the Class 6 &amp; 9 rounds — Science, Mathematics and General Knowledge.
      </Typography>

      <Grid container spacing={3} justifyContent="flex-start">
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
