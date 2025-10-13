// src/components/about/AboutHeader.tsx
import React from 'react';
import { Typography, useTheme } from '@mui/material';

interface AboutHeaderProps {
  title: string;
  subtitle: string;
  accentColor?: string;
}

const AboutHeader: React.FC<AboutHeaderProps> = ({ title, subtitle, accentColor }) => {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.warning.main;

  return (
    <>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          color: effectiveAccentColor,
          mb: 1.5,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' }
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="h6"
        paragraph
        sx={{
          textAlign: 'center',
          color: theme.palette.text.secondary,
          fontStyle: 'italic',
          mb: 3,
          fontSize: { xs: '1rem', sm: '1.125rem' }
        }}
      >
        {subtitle}
      </Typography>
    </>
  );
};

export default AboutHeader;