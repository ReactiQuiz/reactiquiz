// src/components/quiz/homibhabha/HomiBhabhaCard.tsx
import React from 'react';
import { Card, CardContent, CardActions, Button, Typography, useTheme } from '@mui/material';
import { HomiBhabhaCardProps } from '../../../types';

const HomiBhabhaCard: React.FC<HomiBhabhaCardProps> = ({ 
  icon, 
  title, 
  description, 
  buttonText, 
  onClick, 
  accentColor 
}) => {
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
