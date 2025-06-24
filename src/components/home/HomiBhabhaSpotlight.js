// src/components/home/HomiBhabhaSpotlight.js
import React from 'react';
import { Box, Card, CardContent, Typography, Button, Container, useTheme, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { darken } from '@mui/material/styles';

function HomiBhabhaSpotlight() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ py: { xs: 4, sm: 6 } }}>
      <Container maxWidth="md"> {/* Changed to md for better focus on this single card */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium', textAlign: 'center', mb: 4, color: theme.palette.secondary.light, fontSize: {xs: '1.5rem', sm: '2rem'} }}>
          Specialized Exam Preparation
        </Typography>
        <Card
          elevation={5}
          sx={{
            display: 'flex',
            flexDirection: 'column', // Base direction
            border: `2px solid ${theme.palette.secondary.main}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(5px)',
            transition: 'all 0.3s ease-in-out',
            width: '100%',
            borderRadius: theme.shape.borderRadius * 1.5,
            '&:hover': {
              transform: { sm: 'scale(1.02)' }, // Apply scale only on sm and up
              boxShadow: { sm: `0px 5px 20px ${alpha(theme.palette.secondary.main, 0.5)}` },
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
            <SchoolIcon sx={{ fontSize: { xs: 45, sm: 55, md: 60 }, color: theme.palette.secondary.main, mb: { xs: 1.5, sm: 0 }, mr: { sm: 2.5 } }} />
            <CardContent sx={{ textAlign: { xs: 'center', sm: 'left' }, flexGrow: 1, p: 0, '&:last-child': { pb: 0 } }}>
              <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.secondary.light, fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' }, mb: 0.75 }}>
                Homi Bhabha Exam Prep
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, lineHeight: 1.6, }}>
                Excel in the Balvaidnyanik competition with specialized practice tests and PYQs tailored for 6th & 9th Standards.
              </Typography>
            </CardContent>
            <Box sx={{ ml: { sm: 2 }, mt: { xs: 2, sm: 0 }, width: {xs: '100%', sm: 'auto'} }}>
              <Button
                variant="contained"
                onClick={(e) => { e.stopPropagation(); navigate('/homibhabha'); }}
                endIcon={<ArrowForwardIcon />}
                size="medium"
                fullWidth // Make button full width on xs
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  py: { xs: 1.2, sm: 1.2 }, // Consistent padding
                  px: { xs: 2, sm: 3 },
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.getContrastText(theme.palette.secondary.main),
                  '&:hover': { backgroundColor: darken(theme.palette.secondary.main, 0.2) },
                  [theme.breakpoints.up('sm')]: { // Apply only on sm and up
                        width: 'auto', // Revert to auto width on sm+
                  },
                }}
              >
                Explore Resources
              </Button>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}

export default HomiBhabhaSpotlight;