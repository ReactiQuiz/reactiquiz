// src/components/about/AboutHeader.tsx
/**
 * About Header Component
 * 
 * This component displays a header section with title and subtitle
 * for the About page. It supports custom accent colors and responsive
 * typography.
 */
import React from 'react';
import { Typography, useTheme } from '@mui/material';

/**
 * AboutHeaderProps Interface
 * 
 * Props for the AboutHeader component.
 */
interface AboutHeaderProps {
  title: string; // Header title text
  subtitle: string; // Subtitle text
  accentColor?: string; // Optional accent color for title
}

/**
 * About Header Component
 * 
 * Displays a header section with:
 * - Title with customizable accent color
 * - Subtitle with secondary text styling
 * - Responsive typography (mobile and desktop)
 * - Centered alignment
 * 
 * This component is used on the AboutPage to display the page
 * header and subtitle.
 * 
 * @param {AboutHeaderProps} props - Component props
 * @returns {JSX.Element} Header section with title and subtitle
 */
const AboutHeader: React.FC<AboutHeaderProps> = ({ title, subtitle, accentColor }) => {
  // Get theme for styling
  const theme = useTheme();
  // Use accent color or default to warning theme color
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