// src/pages/HomibhabhaPage.js
import { useState } from 'react';
import {
  Box, Typography, useTheme, Card, CardContent, CardActions, Button, Grid
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useNavigate } from 'react-router-dom';

import PYQPapersModal from '../components/PYQPapersModal';
import PracticeTestModal from '../components/PracticeTestModal'; // Ensure this is correctly imported

function HomibhabhaPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const homiBhabhaAccentColor = theme.palette.secondary.main;

  const [pyqModalOpen, setPyqModalOpen] = useState(false);
  const [practiceTestModalOpen, setPracticeTestModalOpen] = useState(false);

  const handleOpenPyqModal = () => {
    setPyqModalOpen(true);
  };

  const handleClosePyqModal = () => {
    setPyqModalOpen(false);
  };

  const handleStartPyqTest = (settings) => {
    console.log("Starting PYQ Test with settings:", settings);
    // This logic remains for actual PYQ papers if you have specific topicIds for them
    navigate(`/quiz/pyq-${settings.class}-${settings.year}`, {
      state: {
        difficulty: 'mixed', 
        numQuestions: 100, 
        topicName: `Homi Bhabha PYQ ${settings.class}th - ${settings.year}`,
        accentColor: homiBhabhaAccentColor,
        quizClass: settings.class,
        subject: "homibhabha-pyq", // Differentiate from general practice
        isPYQ: true,
        year: settings.year
      }
    });
    handleClosePyqModal();
  };

  const handleOpenPracticeTestModal = () => {
    setPracticeTestModalOpen(true);
  };

  const handleClosePracticeTestModal = () => {
    setPracticeTestModalOpen(false);
  };

  const handleStartPracticeTest = (settings) => {
    console.log("Starting Homi Bhabha Practice Test with settings:", settings);
    
    // For a Homi Bhabha practice test, we'll use a special identifier
    // or pass detailed composition instructions to QuizPage.
    // The 'topicId' here is more of a placeholder for the QuizPage routing.
    navigate(`/quiz/homibhabha-practice-${settings.class}`, { 
      state: {
        quizType: 'homibhabha-practice', // Special flag for QuizPage
        quizClass: settings.class, // e.g., "6" or "9"
        difficulty: settings.difficulty, // e.g., "easy", "medium", "hard", "mixed"
        topicName: `Homi Bhabha Practice Test - Std ${settings.class}th (${settings.difficulty})`,
        accentColor: homiBhabhaAccentColor,
        subject: "homibhabha", // General subject category
        timeLimit: 90 * 60, // 90 minutes in seconds
        questionComposition: { // Desired number of questions per subject
          physics: 30,
          chemistry: 30,
          biology: 30,
          gk: 10
        },
        totalQuestions: 100 // Explicitly set total questions
      }
    });
    handleClosePracticeTestModal();
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    border: `1px solid ${homiBhabhaAccentColor}`,
    borderRadius: theme.shape.borderRadius * 2,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[6],
    },
    width: '100%'
  };

  return (
    <Box sx={{ p: 3, flexGrow: 1, width: '100%'}}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: homiBhabhaAccentColor,
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 4
        }}
      >
        Homi Bhabha Balvaidnyanik Resources
      </Typography>

      <Grid container spacing={4} justifyContent="center" alignItems="stretch">
        <Grid item xs={12} sm={6} md={5} sx={{ display: 'flex', width: '100%' }}>
          <Card sx={cardStyle}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <DescriptionIcon sx={{ fontSize: 60, color: homiBhabhaAccentColor, mb: 2 }} />
              <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'medium' }}>
                Previous Year Papers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Access and review question papers from previous Homi Bhabha Balvaidnyanik exams to understand patterns and difficulty levels.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', p: 2, mt: 'auto' }}>
              <Button
                size="large"
                variant="contained"
                onClick={handleOpenPyqModal}
                sx={{
                  backgroundColor: homiBhabhaAccentColor,
                  color: theme.palette.getContrastText(homiBhabhaAccentColor),
                  '&:hover': {
                    backgroundColor: theme.palette.augmentColor({ color: { main: homiBhabhaAccentColor } }).dark,
                  }
                }}
              >
                View Papers
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={5} sx={{ display: 'flex', width: '100%' }}>
          <Card sx={cardStyle}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <EditNoteIcon sx={{ fontSize: 60, color: homiBhabhaAccentColor, mb: 2 }} />
              <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'medium' }}>
                Practice Test Papers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Take practice tests designed to simulate the Homi Bhabha exam environment and assess your preparation. (100 Questions, 90 Minutes)
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', p: 2, mt: 'auto' }}>
              <Button
                size="large"
                variant="contained"
                onClick={handleOpenPracticeTestModal}
                sx={{
                  backgroundColor: homiBhabhaAccentColor,
                  color: theme.palette.getContrastText(homiBhabhaAccentColor),
                  '&:hover': {
                    backgroundColor: theme.palette.augmentColor({ color: { main: homiBhabhaAccentColor } }).dark,
                  }
                }}
              >
                Start Practice Test
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography paragraph color="text.secondary">
          More resources and information will be added here soon.
        </Typography>
      </Box>

      <PYQPapersModal
        open={pyqModalOpen}
        onClose={handleClosePyqModal}
        onSubmit={handleStartPyqTest}
        accentColor={homiBhabhaAccentColor}
      />

      <PracticeTestModal
        open={practiceTestModalOpen}
        onClose={handleClosePracticeTestModal}
        onSubmit={handleStartPracticeTest}
        accentColor={homiBhabhaAccentColor}
      />
    </Box>
  );
}

export default HomibhabhaPage;