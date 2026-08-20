// src/components/quiz/homibhabha/HomiBhabhaCard.tsx
/**
 * Homi Bhabha Card Component
 * 
 * This component displays a card for Homi Bhabha exam quiz options.
 * It shows an icon, title, description, and action button with
 * hover animations and accent color styling.
 */
import React from 'react';
import { Card, CardContent, CardActions, Button, Typography, useTheme } from '@mui/material';
import { HomiBhabhaCardProps } from '../../../types';

/**
 * Homi Bhabha Card Component
 * 
 * Displays a card for Homi Bhabha exam quiz options. Features:
 * - Icon display (custom icon component)
 * - Title and description text
 * - Action button with accent color
 * - Hover animations (lift effect)
 * - Accent color border
 * 
 * This component is used on the HomibhabhaPage to display
 * PYQ (Previous Year Questions) and Practice Test options.
 * 
 * @param {HomiBhabhaCardProps} props - Component props
 * @returns {JSX.Element} Homi Bhabha card with icon, text, and button
 */
const HomiBhabhaCard: React.FC<HomiBhabhaCardProps> = ({ 
  icon, 
  title, 
  description, 
  buttonText, 
  onClick, 
  accentColor 
}) => {
  // Get theme for styling
  const theme = useTheme();

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    border: `1px solid ${accentColor}`,
    borderRadius: theme.shape.borderRadius * 2,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[6],
    },
    width: '100%'
  };

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        {icon}
        <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'medium' }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', p: 2, mt: 'auto' }}>
        <Button
          size="large"
          variant="contained"
          onClick={onClick}
          sx={{
            backgroundColor: accentColor,
            color: theme.palette.getContrastText(accentColor),
            '&:hover': {
              backgroundColor: theme.palette.augmentColor({ color: { main: accentColor } }).dark,
            }
          }}
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};

export default HomiBhabhaCard;
