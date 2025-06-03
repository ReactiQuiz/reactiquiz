// src/pages/HomePage.js
import { Box, Typography, Card, CardContent, CardActionArea, Button, useTheme, alpha, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { darken } from '@mui/material/styles';

import { subjectAccentColors } from '../theme';
import TopicCard from '../components/TopicCard';

const allSubjectsForDisplay = [
  { name: 'Physics', path: '/physics', color: subjectAccentColors.physics, id: 'physics-home-scroll', description: 'Explore motion, energy, light, and the universe.' },
  { name: 'Chemistry', path: '/chemistry', color: subjectAccentColors.chemistry, id: 'chemistry-home-scroll', description: 'Dive into matter & reactions.' },
  { name: "Biology", path: "/biology", color: subjectAccentColors.biology, id: 'biology-home-scroll', description: 'Discover the living world.' },
  { name: "Mathematics", path: "/mathematics", color: subjectAccentColors.mathematics, id: 'mathematics-home-scroll', description: 'Sharpen algebra & geometry.' },
  { name: "GK", path: "/gk", color: subjectAccentColors.gk, id: 'gk-home-scroll', description: 'Test your general awareness.' },
  { name: 'Homibhabha', path: '/homibhabha', color: (theme) => theme.palette.secondary.main, id: 'homibhabha-home-scroll', description: 'Specialized prep for the exam.'}
];

function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 2.5, fontWeight: 'bold' }}>
        Welcome to ReactiQuiz!
      </Typography>

      {/* Homi Bhabha Promo Section (no changes here from previous version) */}
      <Box sx={{ mb: 3.5 }}>
          <Card
            elevation={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: `2px solid ${theme.palette.secondary.main}`,
              backgroundColor: alpha(theme.palette.secondary.dark, 0.18),
              transition: 'all 0.2s ease-in-out',
              width: '100%',
              '&:hover': {
                transform: 'scale(1.005)',
                boxShadow: `0px 0px 15px ${alpha(theme.palette.secondary.main, 0.65)}`,
              }
            }}
          >
            <CardActionArea
                onClick={() => navigate('/homibhabha')}
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: {xs: 'column', sm: 'row'},
                    alignItems: 'center',
                    p: { xs: 1.5, sm: 2 }
                }}
            >
              <SchoolIcon sx={{
                  fontSize: {xs: 40, sm: 50, md: 56},
                  color: theme.palette.secondary.main,
                  mb: {xs: 1, sm: 0},
                  mr: {sm: 2}
              }} />
              <CardContent sx={{
                  textAlign: {xs: 'center', sm: 'left'},
                  flexGrow: 1,
                  p:0,
                  '&:last-child': { pb: 0 }
              }}>
                <Typography gutterBottom variant="h5" component="div" sx={{
                    fontWeight: 'bold',
                    color: theme.palette.secondary.light,
                    fontSize: {xs: '1.1rem', sm: '1.3rem', md: '1.4rem'},
                    lineHeight: 1.25,
                    mb: 0.5
                }}>
                  Homi Bhabha Exam Preparation
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{
                    fontSize: {xs: '0.85rem', sm: '0.9rem', md: '0.95rem'},
                    lineHeight: 1.4,
                }}>
                  Excel in the Balvaidnyanik competition with our specialized practice tests and Previous Year Question papers.
                </Typography>
              </CardContent>
              <Box sx={{ml: {sm: 2 }, mt: {xs: 1.5, sm: 0 }}}>
                <Button
                    variant="contained"
                    onClick={(e) => { e.stopPropagation(); navigate('/homibhabha');}}
                    endIcon={<ArrowForwardIcon />}
                    size="medium"
                    sx={{
                        fontSize: {xs: '0.75rem', sm: '0.8rem'},
                        py: {xs: 0.8, sm: 1},
                        px: {xs: 1.5, sm: 2},
                        backgroundColor: theme.palette.secondary.main,
                        color: theme.palette.getContrastText(theme.palette.secondary.main),
                        '&:hover': { backgroundColor: darken(theme.palette.secondary.main, 0.2)}
                    }}
                >
                    Explore Resources
                </Button>
            </Box>
            </CardActionArea>
          </Card>
      </Box>


      {/* Subject Grid Section */}
      <Box
        sx={{
          my: 3.5,
        }}
      >
        <Typography variant="h5" gutterBottom
          sx={{
            textAlign: 'left',
            mb: 2,
            fontWeight: 'medium',
          }}
        >
          Explore Subjects
        </Typography>
        <Grid container spacing={2.5}>
          {allSubjectsForDisplay.map((subject) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={subject.id} sx={{ display: 'flex' }}> {/* Key change: Added sx={{ display: 'flex' }} */}
              <TopicCard
                topic={{...subject, color: typeof subject.color === 'function' ? subject.color(theme) : subject.color}}
                onStartQuiz={() => navigate(subject.path)}
                accentColor={typeof subject.color === 'function' ? subject.color(theme) : subject.color}
                subjectBasePath={subject.name.toLowerCase()}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default HomePage;