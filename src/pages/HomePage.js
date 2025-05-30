import { Box, Typography, Card, CardContent, CardActionArea, Button, useTheme, alpha } from '@mui/material'; // Removed Grid, Paper, CircularProgress, Alert
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { darken } from '@mui/material/styles';

// Removed apiClient and HistoricalResultItem imports as they are not used

import { subjectAccentColors } from '../theme';
import TopicCard from '../components/TopicCard';

const allSubjectsForScroll = [
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

  // useEffect for fetching latest result is removed

  const defaultContainerPaddingX = theme.spacing(3); 
  const xsContainerPaddingX = theme.spacing(2);    

  return (
    <Box sx={{ py: { xs: 1, sm: 2 } }}> 
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
        Welcome to ReactiQuiz!
      </Typography>

      {/* Homi Bhabha Promo Section - Full Width */}
      <Box sx={{ mb: 4 }}> {/* Container for the Homi Bhabha card */}
          <Card
            elevation={3}
            sx={{
              // height: '100%', // Not strictly needed if it's the only item in its flow
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: `2px solid ${theme.palette.secondary.main}`,
              backgroundColor: alpha(theme.palette.secondary.dark, 0.2), 
              transition: 'all 0.3s ease',
              width: '100%', // Make card take full width of its parent Box
              '&:hover': {
                transform: 'scale(1.01)', // Subtle hover effect
                boxShadow: `0px 0px 15px ${alpha(theme.palette.secondary.main, 0.7)}`,
              }
            }}
          >
            <CardActionArea onClick={() => navigate('/homibhabha')} sx={{ flexGrow: 1, display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, alignItems: 'center', p: { xs: 2, sm: 2.5 } }}>
              <SchoolIcon sx={{ fontSize: {xs: 48, sm: 60, md: 70}, color: theme.palette.secondary.main, mb: {xs: 1.5, sm: 0}, mr: {sm: 2.5} }} />
              <CardContent sx={{ textAlign: {xs: 'center', sm: 'left'}, flexGrow: 1, p:0, '&:last-child': { pb: 0 } }}>
                <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.secondary.light, fontSize: {xs: '1.2rem', sm: '1.5rem'}, lineHeight: 1.2 }}>
                  Homi Bhabha Exam Preparation
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{fontSize: {xs: '0.875rem', sm: '1rem'}, lineHeight: 1.4, mt: 0.5 }}>
                  Excel in the Balvaidnyanik competition with our specialized practice tests and Previous Year Question papers.
                </Typography>
              </CardContent>
              <Box sx={{ml: {sm: 2}, mt: {xs: 2, sm: 0}}}>
                <Button
                    variant="contained"
                    // size="small" // Can be medium by default
                    onClick={(e) => { e.stopPropagation(); navigate('/homibhabha');}} // Prevent CardActionArea click if button is separate
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        fontSize: {xs: '0.8rem', sm: '0.875rem'},
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


      {/* Subject Scrollable List Section - Full Width */}
      <Box 
        sx={{ 
          my: 4,
          marginLeft: { xs: `-${xsContainerPaddingX}`, sm: `-${defaultContainerPaddingX}` },
          marginRight: { xs: `-${xsContainerPaddingX}`, sm: `-${defaultContainerPaddingX}` },
          width: { 
            xs: '100vw', 
            sm: '100vw' 
          },
          position: 'relative', 
          boxSizing: 'border-box', 
        }}
      >
        <Typography variant="h5" gutterBottom 
          sx={{ 
            textAlign: 'center', 
            mb: 2, 
            fontWeight: 'medium',
            px: { 
              xs: xsContainerPaddingX, 
              sm: defaultContainerPaddingX
            }
          }}
        >
          Explore Subjects
        </Typography>
        <Box 
          sx={{
            display: 'flex',
            overflowX: 'auto', 
            pb: 2, 
            px: { 
              xs: xsContainerPaddingX, 
              sm: defaultContainerPaddingX
            },
            '&::-webkit-scrollbar': { 
              height: '6px', 
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.text.secondary, 0.4),
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
                background: alpha(theme.palette.text.primary, 0.6),
            },
            scrollbarWidth: 'thin',  
            scrollbarColor: `${alpha(theme.palette.text.secondary, 0.4)} transparent`, 
          }}
        >
          {allSubjectsForScroll.map((subject) => ( 
            <Box 
              key={subject.id} 
              sx={{ 
                minWidth: {xs: '180px', sm: '240px', md: '260px'}, 
                maxWidth: {xs: '200px', sm: '260px', md: '280px'}, 
                mr: 2, 
                flexShrink: 0,
                '&:last-child': {
                  mr: 0, 
                }
              }}
            >
              <TopicCard
                topic={{...subject, color: typeof subject.color === 'function' ? subject.color(theme) : subject.color}}
                onStartQuiz={() => navigate(subject.path)} 
                accentColor={typeof subject.color === 'function' ? subject.color(theme) : subject.color}
                subjectBasePath={subject.name.toLowerCase()}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default HomePage;