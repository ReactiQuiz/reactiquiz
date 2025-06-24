// src/components/about/CreatorProfile.js
import React from 'react';
import {
  Box, Typography, Avatar, Link, Grid, IconButton, Tooltip, useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

// Constants can be passed as props or defined here if they are static for this component
const YOUR_PROFILE_IMAGE_URL_DEFAULT = `${process.env.PUBLIC_URL}/profile-placeholder.png`; // Default

function CreatorProfile({
  profileImageUrl = YOUR_PROFILE_IMAGE_URL_DEFAULT,
  name,
  title,
  bio,
  email,
  phone,
  linkedinUrl,
  githubUrl,
  discordUrl,
  accentColor,
  onOpenContactDialog // Prop to handle opening dialog from parent
}) {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.warning.main;

  return (
    <Box sx={{ border: `2px solid ${effectiveAccentColor}`, borderRadius: 2, p: { xs: 2, sm: 3 }, backgroundColor: alpha(effectiveAccentColor, 0.05) }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 600, color: effectiveAccentColor, mb: 3, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
        Meet the Creator
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar
            alt={name}
            src={profileImageUrl}
            sx={{ width: {xs: 120, sm: 150}, height: {xs:120, sm:150}, border: `3px solid ${effectiveAccentColor}` }}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'medium', color: theme.palette.text.primary, fontSize: {xs: '1.1rem', sm: '1.25rem'} }}>
            {name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{fontSize: {xs: '0.9rem', sm: '1rem'}}}>
            {title}
          </Typography>
          <Typography variant="body2" paragraph sx={{ color: theme.palette.text.secondary, fontSize: {xs: '0.85rem', sm: '0.9rem'} }}>
            {bio}
          </Typography>
          <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: {xs: 'center', sm: 'flex-start'} }}>
            {email && (
              <Tooltip title="Send Email">
                <IconButton onClick={() => onOpenContactDialog('Email Address', email)} sx={{ color: effectiveAccentColor, '&:hover': { backgroundColor: alpha(effectiveAccentColor, 0.1) } }}>
                  <EmailIcon />
                </IconButton>
              </Tooltip>
            )}
            {phone && (
              <Tooltip title="View Phone Number">
                <IconButton onClick={() => onOpenContactDialog('Phone Number', phone)} sx={{ color: effectiveAccentColor, '&:hover': { backgroundColor: alpha(effectiveAccentColor, 0.1) } }}>
                  <PhoneIcon />
                </IconButton>
              </Tooltip>
            )}
            {linkedinUrl && (
              <Tooltip title="LinkedIn Profile">
                <Link href={linkedinUrl} target="_blank" rel="noopener noreferrer" sx={{ color: effectiveAccentColor, '&:hover': { backgroundColor: alpha(effectiveAccentColor, 0.1) }, display: 'inline-flex', borderRadius: '50%', p: '8px' }}>
                  <LinkedInIcon />
                </Link>
              </Tooltip>
            )}
            {githubUrl && (
              <Tooltip title="GitHub Profile">
                <Link href={githubUrl} target="_blank" rel="noopener noreferrer" sx={{ color: effectiveAccentColor, '&:hover': { backgroundColor: alpha(effectiveAccentColor, 0.1) }, display: 'inline-flex', borderRadius: '50%', p: '8px' }}>
                  <GitHubIcon />
                </Link>
              </Tooltip>
            )}
            {discordUrl && (
              <Tooltip title="Join Discord Server">
                <Link href={discordUrl} target="_blank" rel="noopener noreferrer" sx={{ color: effectiveAccentColor, '&:hover': { backgroundColor: alpha(effectiveAccentColor, 0.1) }, display: 'inline-flex', borderRadius: '50%', p: '8px', fontSize: '1.25rem' }}>
                  <FontAwesomeIcon icon={faDiscord} />
                </Link>
              </Tooltip>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CreatorProfile;