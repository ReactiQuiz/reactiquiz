// src/components/about/CreatorProfile.tsx
/**
 * Creator Profile Component
 * 
 * This component displays a creator profile card on the About page.
 * It includes the creator's avatar, name, role, bio, and social media
 * links with icons.
 */
import React from 'react';
import { Paper, Typography, Avatar, IconButton, Box, useTheme } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

/**
 * Creator Profile Component
 * 
 * Displays a creator profile card with:
 * - Creator avatar image
 * - Name and role/description
 * - Bio text
 * - Social media links (Email, GitHub, LinkedIn, Discord)
 * - Responsive styling
 * - Centered layout
 * 
 * This component is used on the AboutPage to introduce the
 * application creator and provide contact/social links.
 * 
 * @returns {JSX.Element} Creator profile card with social links
 */
const CreatorProfile: React.FC = () => {
  // Get theme for styling
  const theme = useTheme();

  return (
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
      
      <Avatar
        alt="Sanskar Sontakke"
        src={process.env.PUBLIC_URL + '/profile-sanskar.png'}
        sx={{
          width: 150,
          height: 150,
          margin: '0 auto',
          mb: 2,
          border: `3px solid ${theme.palette.primary.main}`,
        }}
      />

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
          <FontAwesomeIcon icon={['fab', 'discord'] as any} />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default CreatorProfile;