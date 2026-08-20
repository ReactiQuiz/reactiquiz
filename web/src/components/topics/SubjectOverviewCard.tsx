// src/components/topics/SubjectOverviewCard.tsx
/**
 * Subject Overview Card Component
 *
 * Displays a subject overview card on the AllSubjects page, styled with
 * the subject's accent color inherited directly from the database.
 */
import React from 'react';
import { Card, CardContent, Typography, CardActions, Button, Box, alpha, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getIconComponent } from '../../utils/getIconComponent';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';
import { Subject } from '../../types';

interface SubjectOverviewCardProps {
  subject: Subject;
  onExploreClick: (subjectKey: string) => void;
}

const SubjectOverviewCard: React.FC<SubjectOverviewCardProps> = ({ subject, onExploreClick }) => {
  const { getColor } = useSubjectColors();
  const theme = useTheme();
  const IconComponent = getIconComponent(subject.icon || (subject as any).iconName);

  // Inherit subject color directly from DB object or via SubjectColorsContext
  const dbModeColor = theme.palette.mode === 'dark' ? subject.accentColorDark : subject.accentColorLight;
  const accentColor = dbModeColor || getColor(subject.subjectKey || subject.id) || theme.palette.primary.main;

  return (
    <Card 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: alpha(accentColor, 0.5),
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box 
          sx={{ 
            width: 44, 
            height: 44, 
            borderRadius: '50%', 
            display: 'grid', 
            placeItems: 'center', 
            background: alpha(accentColor, 0.16), 
            mb: 1.5 
          }}
        >
          <IconComponent sx={{ fontSize: 22, color: accentColor }} />
        </Box>
        <Typography gutterBottom variant="h5" component="div" sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
          {subject.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subject.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          size="small" 
          variant="outlined" 
          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />} 
          onClick={() => onExploreClick(subject.subjectKey)}
          sx={{
            borderColor: alpha(accentColor, 0.5),
            color: accentColor,
            '&:hover': {
              borderColor: accentColor,
              bgcolor: alpha(accentColor, 0.08),
            }
          }}
        >
          Explore topics
        </Button>
      </CardActions>
    </Card>
  );
};

export default SubjectOverviewCard;
