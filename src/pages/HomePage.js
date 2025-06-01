// src/pages/HomePage.js
import { Box, Typography, Card, CardContent, CardActionArea, Button, useTheme, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { darken } from '@mui/material/styles';

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

  // Define consistent horizontal padding for page content sections
  // This helps align content that is not edge-to-edge with the scrollable section's content
  const defaultContainerPaddingX = theme.spacing(3); // Default padding for sm and up
  const xsContainerPaddingX = theme.spacing(2);    // Padding for xs screens

  return (
    <Box sx={{ py: { xs: 1, sm: 2 } }}> {/* Reduced overall vertical padding for the page */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
        Welcome to ReactiQuiz!
      </Typography>

      {/* Homi Bhabha Promo Section - Full Width */}
      <Box sx={{ mb: 4, px: { xs: xsContainerPaddingX, sm: defaultContainerPaddingX } }}> {/* Container for the Homi Bhabha card */}
          <Card
            elevation={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: `2px solid ${theme.palette.secondary.main}`,
              backgroundColor: alpha(theme.palette.secondary.dark, 0.2), 
              transition: 'all 0.3s ease',
              width: '100%', // Make card take full width of its parent Box
              '&:hover': {
                transform: 'scale(1.01)', 
                boxShadow: `0px 0px 15px ${alpha(theme.palette.secondary.main, 0.7)}`,
              }
            }}
          >
            <CardActionArea 
                onClick={() => navigate('/homibhabha')} 
                sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: {xs: 'column', sm: 'row'}, // Stack on xs, row on sm+
                    alignItems: 'center', 
                    p: { xs: 2, sm: 2.5 } // Responsive padding
                }}
            >
              <SchoolIcon sx={{ 
                  fontSize: {xs: 48, sm: 60, md: 70}, // Responsive icon size
                  color: theme.palette.secondary.main, 
                  mb: {xs: 1.5, sm: 0}, // Margin bottom on xs, margin right on sm+
                  mr: {sm: 2.5} 
              }} />
              <CardContent sx={{ 
                  textAlign: {xs: 'center', sm: 'left'}, // Center text on xs, left on sm+
                  flexGrow: 1, 
                  p:0, // Remove default padding
                  '&:last-child': { pb: 0 } // Remove padding-bottom from last-child
              }}>
                <Typography gutterBottom variant="h5" component="div" sx={{ 
                    fontWeight: 'bold', 
                    color: theme.palette.secondary.light,
                    fontSize: {xs: '1.2rem', sm: '1.5rem'}, // Responsive font size
                    lineHeight: 1.2 
                }}>
                  Homi Bhabha Exam Preparation
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{
                    fontSize: {xs: '0.875rem', sm: '1rem'}, // Responsive font size
                    lineHeight: 1.4, 
                    mt: 0.5 
                }}>
                  Excel in the Balvaidnyanik competition with our specialized practice tests and Previous Year Question papers.
                </Typography>
              </CardContent>
              <Box sx={{ml: {sm: 2}, mt: {xs: 2, sm: 0}}}> {/* Spacing for the button */}
                <Button
                    variant="contained"
                    onClick={(e) => { e.stopPropagation(); navigate('/homibhabha');}}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        fontSize: {xs: '0.8rem', sm: '0.875rem'}, // Responsive button font size
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
          my: 4, // Vertical margin for the section
          // Apply negative margins to make the scrollable content appear edge-to-edge
          // These negative margins counteract the AppRoutes Container's padding
          marginLeft: { xs: `-${xsContainerPaddingX}`, sm: `-${defaultContainerPaddingX}` },
          marginRight: { xs: `-${xsContainerPaddingX}`, sm: `-${defaultContainerPaddingX}` },
          width: { // Ensure this Box attempts to be full viewport width (or parent width if AppRoutes is also full-width)
            xs: '100vw', // This can be tricky if AppRoutes itself has max-width
            sm: '100vw' // We want the scroll to feel edge-to-edge
          },
          position: 'relative', // For any potential absolute positioned children if needed
          boxSizing: 'border-box', // Ensures padding/border are included in width/height
        }}
      >
        <Typography variant="h5" gutterBottom 
          sx={{ 
            textAlign: 'center', 
            mb: 2, 
            fontWeight: 'medium',
            // Add padding back to the title to align it with other content
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
            overflowX: 'auto', // Enable horizontal scrolling
            pb: 2, // Padding at the bottom for scrollbar
            // Add horizontal padding inside the scrollable area
            // This ensures the first and last cards have some space from the edges
            px: { 
              xs: xsContainerPaddingX, 
              sm: defaultContainerPaddingX
            },
            // Custom scrollbar styles
            '&::-webkit-scrollbar': { 
              height: '6px', // Slimmer scrollbar
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.text.secondary, 0.4),
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
                background: alpha(theme.palette.text.primary, 0.6),
            },
            scrollbarWidth: 'thin',  // For Firefox
            scrollbarColor: `${alpha(theme.palette.text.secondary, 0.4)} transparent`, // For Firefox
          }}
        >
          {allSubjectsForScroll.map((subject) => ( 
            <Box 
              key={subject.id} 
              sx={{ 
                minWidth: {xs: '180px', sm: '240px', md: '260px'}, // Min width for cards
                maxWidth: {xs: '200px', sm: '260px', md: '280px'}, // Max width for cards
                mr: 2, // Margin between cards
                flexShrink: 0, // Prevent cards from shrinking
                '&:last-child': { // Remove margin from the last card
                  mr: 0, 
                }
              }}
            >
              <TopicCard
                topic={{...subject, color: typeof subject.color === 'function' ? subject.color(theme) : subject.color}}
                onStartQuiz={() => navigate(subject.path)} // Navigate to subject page
                accentColor={typeof subject.color === 'function' ? subject.color(theme) : subject.color}
                subjectBasePath={subject.name.toLowerCase()}
                // onStudyFlashcards is not passed, so the button won't appear on homepage cards
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* You can add more sections here if needed, following similar padding patterns */}

    </Box>
  );
}

export default HomePage;