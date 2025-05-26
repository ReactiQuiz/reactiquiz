// src/pages/HomibhabhaPage.js
import { useState } from 'react'; // Removed useEffect
import {
  Box, Typography, useTheme, Card, CardContent, CardActions, Button, Grid
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useNavigate } from 'react-router-dom';
// import { subjectAccentColors } from '../theme'; // Keep if you want to use a specific subject accent

import PYQPapersModal from '../components/PYQPapersModal'; // Import new modal
import PracticeTestModal from '../components/PracticeTestModal'; // Import new modal

function HomibhabhaPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const homiBhabhaAccentColor = theme.palette.secondary.main; // Or choose another

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
    // Navigate to a quiz page, passing class and year to fetch/filter questions
    // Example: You'll need a new topicId scheme or way to identify PYQs
    // For now, let's assume a generic topicId like 'homibhabha-pyq-${settings.class}-${settings.year}'
    // and you'd need to create corresponding JSON question files.
    navigate(`/quiz/homibhabha/pyq-${settings.class}-${settings.year}`, {
      state: {
        difficulty: 'mixed', // PYQs are usually mixed
        numQuestions: 100, // Or fetch actual number based on paper
        topicName: `Homi Bhabha PYQ ${settings.class}th - ${settings.year}`,
        accentColor: homiBhabhaAccentColor,
        quizClass: settings.class,
        isPYQ: true, // Add a flag if needed
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
    console.log("Starting Practice Test with settings:", settings);
    // Navigate to a quiz page for practice tests
    // Example: topicId could be `homibhabha-practice-${settings.class}`
    navigate(`/quiz/homibhabha/practice-${settings.class}-${settings.difficulty}`, {
      state: {
        difficulty: settings.difficulty,
        numQuestions: 50, // Or a configurable number for practice tests
        topicName: `Homi Bhabha Practice ${settings.class}th (${settings.difficulty})`,
        accentColor: homiBhabhaAccentColor,
        quizClass: settings.class,
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
    }
  };

  return (
    <Box sx={{ p: 3, flexGrow: 1 }}>
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
        <Grid item xs={12} sm={6} md={5} sx={{ display: 'flex' }}>
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
                onClick={handleOpenPyqModal} // Open PYQ modal
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

        <Grid item xs={12} sm={6} md={5} sx={{ display: 'flex' }}>
          <Card sx={cardStyle}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <EditNoteIcon sx={{ fontSize: 60, color: homiBhabhaAccentColor, mb: 2 }} />
              <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'medium' }}>
                Practice Test Papers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Take practice tests designed to simulate the Homi Bhabha exam environment and assess your preparation.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', p: 2, mt: 'auto' }}>
              <Button
                size="large"
                variant="contained"
                onClick={handleOpenPracticeTestModal} // Open Practice Test modal
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