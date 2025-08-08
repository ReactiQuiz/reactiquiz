// src/pages/AboutPage.js
import { Box, Typography, Paper, Container, Avatar, IconButton, useTheme, Divider } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

function AboutPage() {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 3, md: 5 }, width: '100%' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ backgroundColor: 'transparent', p: { xs: 1, sm: 2 } }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              About ReactiQuiz
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Sharpening Minds, One Quiz at a Time.
            </Typography>
          </Box>

          <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            ReactiQuiz is a dynamic and engaging quiz application designed to help students and enthusiasts test and improve their knowledge across various subjects. Built with modern web technologies, it aims to provide a seamless and enjoyable learning experience.
          </Typography>

          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4 },
              my: 5,
              textAlign: 'center',
              border: `1px solid ${theme.palette.divider}`,
              borderColor: 'primary.main',
              borderRadius: 3,
            }}
          >
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'medium', mb: 3 }}>
              Meet the Creator
            </Typography>
            
            {/* --- START OF THE DEFINITIVE FIX --- */}
            <Avatar
              alt="Sanskar Sontakke"
              src="/profile-sanskar.jpg" // This path points to public/profile-sanskar.jpg
              sx={{
                width: 150,
                height: 150,
                margin: '0 auto',
                mb: 2,
                border: `3px solid ${theme.palette.primary.main}`,
              }}
            />
            {/* --- END OF THE DEFINITIVE FIX --- */}

            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Sanskar Sontakke
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Owner, Developer, Creator
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: '600px', margin: '0 auto', mb: 3 }}>
              I am a passionate developer with a keen interest in creating educational tools. ReactiQuiz started as a project to combine my love for learning and coding, aiming to provide a useful resource for students. I believe in making education accessible and engaging through technology.
            </Typography>
            <Box>
              <IconButton component="a" href="mailto:sanskarsontakke@gmail.com" target="_blank" aria-label="Email">
                <FontAwesomeIcon icon={faEnvelope} />
              </IconButton>
              <IconButton component="a" href="https://github.com/sanskarsontakke" target="_blank" aria-label="GitHub">
                <FontAwesomeIcon icon={faGithub} />
              </IconButton>
              <IconButton component="a" href="https://linkedin.com/in/sanskar-sontakke-1a6132247/" target="_blank" aria-label="LinkedIn">
                <FontAwesomeIcon icon={faLinkedin} />
              </IconButton>
              <IconButton component="a" href="https://discord.com/users/832305532559556638" target="_blank" aria-label="Discord">
                <FontAwesomeIcon icon={['fab', 'discord']} />
              </IconButton>
            </Box>
          </Paper>

          <Box sx={{ my: 5 }}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 'medium', mb: 2 }}>Our Mission</Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'text.secondary' }}>
              Our mission is to provide a high-quality, ad-free, and user-friendly platform for learning and self-assessment. We strive to continuously improve ReactiQuiz by adding new features, more topics, and ensuring the accuracy of our content.
            </Typography>
          </Box>
          <Divider sx={{ my: 4 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 'medium', mb: 2 }}>Get Involved</Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'text.secondary' }}>
              ReactiQuiz is an open-source project. If you are a developer, educator, or student who would like to contribute, we would love to have you. Visit our GitHub organization to learn more.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default AboutPage;