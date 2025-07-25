// src/pages/HomibhabhaPage.js
import { Box, Typography, useTheme, Card, CardContent, CardActions, Button, Grid } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import EditNoteIcon from '@mui/icons-material/EditNote';

import { useHomibhabha } from '../hooks/useHomibhabha';
import PYQPapersModal from '../components/quiz/homibhabha/PYQPapersModal';
import PracticeTestModal from '../components/quiz/homibhabha/PracticeTestModal';

function HomibhabhaPage() {
  const theme = useTheme();

  const {
    pyqModalOpen,
    practiceTestModalOpen,
    homiBhabhaAccentColor,
    handleOpenPyqModal,
    handleClosePyqModal,
    handleStartPyqTest,
    handleOpenPracticeTestModal,
    handleClosePracticeTestModal,
    handleStartPracticeTest, // This will now use the new logic from the hook
  } = useHomibhabha();

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
    <Box sx={{ p: 3, flexGrow: 1, width: '100%' }}>
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