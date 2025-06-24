// src/components/home/KeyFeaturesSection.js
import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Container, Button, Collapse, useTheme } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import TuneIcon from '@mui/icons-material/Tune';
import TimerIcon from '@mui/icons-material/Timer';
import InsightsIcon from '@mui/icons-material/Insights';
import HistoryIcon from '@mui/icons-material/History';
import GroupsIcon from '@mui/icons-material/Groups';
import StyleIcon from '@mui/icons-material/Style';
import DevicesIcon from '@mui/icons-material/Devices';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const features = [
  { iconName: QuizIcon, title: "Diverse Quizzes", description: "Test your knowledge across Physics, Chemistry, Biology, Mathematics, and General Knowledge." },
  { iconName: TuneIcon, title: "Customizable Experience", description: "Tailor quizzes by selecting difficulty levels and the number of questions to fit your study needs." },
  { iconName: TimerIcon, title: "Timed Challenges", description: "Simulate exam conditions with timed quizzes, especially for Homi Bhabha preparation." },
  { iconName: InsightsIcon, title: "Instant Feedback", description: "Receive immediate results with scores, percentages, and detailed explanations for every answer." },
  { iconName: HistoryIcon, title: "Track Your Progress", description: "Monitor your learning journey with a persistent history of all your quiz attempts." },
  { iconName: GroupsIcon, title: "Friends & Challenges", description: "Connect with friends, send challenges, and compete to make learning more interactive." },
  { iconName: StyleIcon, title: "Flashcard Study Mode", description: "Review questions and answers effectively using the integrated flashcards feature." },
  { iconName: DevicesIcon, title: "Responsive Design", description: "Enjoy a seamless experience on any device, whether desktop, tablet, or mobile." }
];

const INITIAL_FEATURES_TO_SHOW = 4; // Show 4 initially for better balance with 4-col layout

function KeyFeaturesSection() {
  const theme = useTheme();
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const handleToggleFeatures = () => {
    setShowAllFeatures(!showAllFeatures);
  };

  const renderFeatureCard = (feature, index) => {
    const IconComponent = feature.iconName;
    return (
      // Using the same responsive grid item setup as AllSubjectsPage
      <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ display: 'flex' }}>
        <Paper
          elevation={2}
          sx={{
            p: {xs: 2, sm: 2.5},
            display: 'flex',
            flexDirection: 'column', // Changed to column for icon on top
            alignItems: 'center',   // Center items
            textAlign: 'center',    // Center text
            width: '10000px',
            height: '100%', // Ensure cards in a row have same height if content varies
            borderTop: `3px solid ${theme.palette.primary.main}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: theme.shadows[6]
            }
          }}
        >
          <IconComponent fontSize="large" sx={{ color: theme.palette.primary.light, mb: 1.5 }} />
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 500, fontSize: '1.1rem', color: theme.palette.text.primary }}>
            {feature.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', flexGrow: 1 }}>
            {feature.description}
          </Typography>
        </Paper>
      </Grid>
    );
  };

  return (
    <Box sx={{ py: { xs: 4, sm: 6 } }}>
      <Container maxWidth="lg"> {/* Changed to lg to accommodate 4 columns better */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium', textAlign: 'center', mb: 4, color: theme.palette.primary.light, fontSize: {xs: '1.5rem', sm: '2rem'} }}>
          Packed with Features
        </Typography>
        <Grid container spacing={{xs: 2, md: 3}} justifyContent="center">
          {features.slice(0, INITIAL_FEATURES_TO_SHOW).map((feature, index) => (
            renderFeatureCard(feature, `initial-${index}`)
          ))}
        </Grid>

        <Collapse in={showAllFeatures} timeout="auto" unmountOnExit>
          <Grid container spacing={{xs: 2, md: 3}} justifyContent="center" sx={{ mt: {xs: 2, md: 3} }}>
            {features.slice(INITIAL_FEATURES_TO_SHOW).map((feature, index) => (
              renderFeatureCard(feature, `more-${index}`)
            ))}
          </Grid>
        </Collapse>

        {features.length > INITIAL_FEATURES_TO_SHOW && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              onClick={handleToggleFeatures}
              variant="outlined"
              startIcon={showAllFeatures ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ color: theme.palette.primary.light, borderColor: theme.palette.primary.light }}
            >
              {showAllFeatures ? 'View Less Features' : 'View More Features'}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default KeyFeaturesSection;