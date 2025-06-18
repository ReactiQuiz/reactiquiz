// src/pages/HomePage.js
import { useState, useEffect } from 'react'; // Added useEffect
import { Box, Card, CardContent, Typography, Button, useTheme, alpha, Grid, Paper, Container, Collapse } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { darken } from '@mui/material/styles';

// Icons for features
import QuizIcon from '@mui/icons-material/Quiz';
import TuneIcon from '@mui/icons-material/Tune';
import TimerIcon from '@mui/icons-material/Timer';
import InsightsIcon from '@mui/icons-material/Insights';
import HistoryIcon from '@mui/icons-material/History';
import GroupsIcon from '@mui/icons-material/Groups';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import StyleIcon from '@mui/icons-material/Style';
import DevicesIcon from '@mui/icons-material/Devices';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


const features = [
  {
    icon: <QuizIcon fontSize="large" sx={{ color: theme => theme.palette.primary.light }} />,
    title: "Diverse Quizzes",
    description: "Test your knowledge across Physics, Chemistry, Biology, Mathematics, and General Knowledge.",
  },
  {
    icon: <TuneIcon fontSize="large" sx={{ color: theme => theme.palette.primary.light }} />,
    title: "Customizable Experience",
    description: "Tailor quizzes by selecting difficulty levels and the number of questions to fit your study needs.",
  },
  {
    icon: <TimerIcon fontSize="large" sx={{ color: theme => theme.palette.primary.light }} />,
    title: "Timed Challenges",
    description: "Simulate exam conditions with timed quizzes, especially for Homi Bhabha preparation.",
  },
  {
    icon: <InsightsIcon fontSize="large" sx={{ color: theme => theme.palette.primary.light }} />,
    title: "Instant Feedback",
    description: "Receive immediate results with scores, percentages, and detailed explanations for every answer.",
  },
  {
    icon: <HistoryIcon fontSize="large" sx={{ color: theme => theme.palette.primary.light }} />,
    title: "Track Your Progress",
    description: "Monitor your learning journey with a persistent history of all your quiz attempts.",
  },
  {
    icon: <GroupsIcon fontSize="large" sx={{ color: theme => theme.palette.primary.light }} />,
    title: "Friends & Challenges",
    description: "Connect with friends, send challenges, and compete to make learning more interactive.",
  },
  {
    icon: <StyleIcon fontSize="large" sx={{ color: theme => theme.palette.primary.light }} />,
    title: "Flashcard Study Mode",
    description: "Review questions and answers effectively using the integrated flashcards feature.",
  },
  {
    icon: <DevicesIcon fontSize="large" sx={{ color: theme => theme.palette.primary.light }} />,
    title: "Responsive Design",
    description: "Enjoy a seamless experience on any device, whether desktop, tablet, or mobile.",
  }
];

const INITIAL_FEATURES_TO_SHOW = 3;


function HomePage({ currentUser }) { // Added currentUser prop
  const navigate = useNavigate();
  const theme = useTheme();
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  if (currentUser) {
    return null; // Or a loading indicator while redirecting
  }

  const handleToggleFeatures = () => {
    setShowAllFeatures(!showAllFeatures);
  };

  const renderFeatureCard = (feature, index) => (
      <Grid item xs={12} key={index}>w
        <Paper
          elevation={2}
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            maxWidth: '100%',
            width: '1000px', // Manual style for 100% width
            minHeight: '120px', // Ensure cards have some minimum height for consistency
            borderLeft: `3px solid ${theme.palette.primary.main}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: theme.shadows[6]
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '50px' }}>
            {feature.icon}
          </Box>
          <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 500, fontSize: '1.15rem' }}>
              {feature.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              {feature.description}
            </Typography>
          </Box>
        </Paper>
      </Grid>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 6, sm: 8, md: 10 },
          textAlign: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)} 0%, ${alpha(theme.palette.secondary.dark, 0.8)} 100%)`,
          color: theme.palette.common.white,
          mb: 6,
          borderRadius: { sm: 2 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }, letterSpacing: '-0.5px' }}
          >
            Welcome to ReactiQuiz!
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{ color: alpha(theme.palette.common.white, 0.85), fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            Sharpen Your Mind, One Quiz at a Time.
            <br />
            Explore, Learn, and Challenge Yourself.
          </Typography>
        </Container>
      </Box>

      {/* About ReactiQuiz Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium', color: theme.palette.primary.light }}>
            What is ReactiQuiz?
          </Typography>
          <Typography variant="body1" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, lineHeight: 1.7, maxWidth: '750px', margin: '0 auto', color: theme.palette.text.secondary }}>
            ReactiQuiz is a dynamic and engaging quiz application designed to help users test and improve their knowledge across various subjects.
            Whether you're preparing for exams, looking to learn something new, or just want to challenge your friends, ReactiQuiz offers a rich and interactive experience.
          </Typography>
        </Paper>
      </Container>

      {/* Key Features Section */}
      <Container maxWidth="md" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium', textAlign: 'center', mb: 4, color: theme.palette.primary.light }}>
          Packed with Features
        </Typography>
        <Grid container spacing={3}>
          {features.slice(0, INITIAL_FEATURES_TO_SHOW).map((feature, index) => (
            renderFeatureCard(feature, `initial-${index}`)
          ))}
        </Grid>

        <Collapse in={showAllFeatures} timeout="auto" unmountOnExit>
          <Grid container spacing={3} sx={{ mt: 3 }}> {/* Add mt:3 here if Collapse is active */}
            {features.slice(INITIAL_FEATURES_TO_SHOW).map((feature, index) => (
              renderFeatureCard(feature, `more-${index}`)
            ))}
          </Grid>
        </Collapse>

        {/* "View More" button moved outside the Grid that contains collapsible items */}
        {features.length > INITIAL_FEATURES_TO_SHOW && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              onClick={handleToggleFeatures}
              variant="outlined"
              startIcon={showAllFeatures ? <ExpandLessIcon /> : <ExpandMoreIcon />} // Changed to startIcon for better alignment
              sx={{ color: theme.palette.primary.light, borderColor: theme.palette.primary.light }}
            >
              {showAllFeatures ? 'View Less Features' : 'View More Features'}
            </Button>
          </Box>
        )}
      </Container>

      {/* Homi Bhabha Spotlight */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium', textAlign: 'center', mb: 4, color: theme.palette.secondary.light }}>
          Specialized Exam Preparation
        </Typography>
        <Card
          elevation={5}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: `2px solid ${theme.palette.secondary.main}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(5px)',
            transition: 'all 0.3s ease-in-out',
            width: '100%',
            borderRadius: theme.shape.borderRadius * 1.5,
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: `0px 5px 20px ${alpha(theme.palette.secondary.main, 0.5)}`,
            }
          }}
        >
          <Box
            onClick={() => navigate('/homibhabha')}
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              p: { xs: 2, sm: 3 },
              cursor: 'pointer'
            }}
          >
            <SchoolIcon sx={{
              fontSize: { xs: 45, sm: 55, md: 60 },
              color: theme.palette.secondary.main,
              mb: { xs: 1.5, sm: 0 },
              mr: { sm: 2.5 }
            }} />
            <CardContent sx={{
              textAlign: { xs: 'center', sm: 'left' },
              flexGrow: 1,
              p: 0,
              '&:last-child': { pb: 0 }
            }}>
              <Typography gutterBottom variant="h5" component="div" sx={{
                fontWeight: 'bold',
                color: theme.palette.secondary.light,
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' },
                mb: 0.75
              }}>
                Homi Bhabha Exam Prep
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
                lineHeight: 1.6,
              }}>
                Excel in the Balvaidnyanik competition with specialized practice tests and PYQs tailored for 6th & 9th Standards.
              </Typography>
            </CardContent>
            <Box sx={{ ml: { sm: 2 }, mt: { xs: 2, sm: 0 } }}>
              <Button
                variant="contained"
                onClick={(e) => { e.stopPropagation(); navigate('/homibhabha'); }}
                endIcon={<ArrowForwardIcon />}
                size="medium"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  py: { xs: 1, sm: 1.2 },
                  px: { xs: 2, sm: 3 },
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.getContrastText(theme.palette.secondary.main),
                  '&:hover': { backgroundColor: darken(theme.palette.secondary.main, 0.2) }
                }}
              >
                Explore Resources
              </Button>
            </Box>
          </Box>
        </Card>
      </Container>

      {/* Final CTA Section */}
      <Box sx={{ py: 6, backgroundColor: alpha(theme.palette.background.paper, 0.7), textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium', color: theme.palette.primary.light }}>
            Ready to Start Learning?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
            Dive into a world of knowledge, challenge your friends, and track your progress.
            ReactiQuiz is here to make learning fun and effective.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/account')}
            sx={{
              py: 1.5,
              px: 5,
              fontSize: '1.1rem',
              backgroundColor: theme.palette.primary.main,
              '&:hover': { backgroundColor: darken(theme.palette.primary.main, 0.2) }
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>

    </Box>
  );
}

export default HomePage;