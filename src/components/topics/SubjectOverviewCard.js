// src/components/topics/SubjectOverviewCard.js
import { Card, CardContent, Typography, CardActions, Button, Box, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getIconComponent } from '../../utils/getIconComponent';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';

function SubjectOverviewCard({ subject, onExploreClick }) {
  const theme = useTheme();
  const { getColor } = useSubjectColors();
  const IconComponent = getIconComponent(subject.iconName);
  const accentColor = getColor(subject.subjectKey);
  const contrastText = theme.palette.getContrastText(accentColor);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', borderTop: `4px solid ${accentColor}` }}>
      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        <IconComponent sx={{ fontSize: 40, color: accentColor, mb: 1 }} />
        <Typography gutterBottom variant="h5" component="div" sx={{ color: accentColor, fontWeight: 'bold' }}>
          {subject.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subject.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', p: 2 }}>
        <Button size="medium" variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => onExploreClick(subject.subjectKey)} sx={{ backgroundColor: accentColor, color: contrastText, '&:hover': { backgroundColor: (theme) => theme.palette.augmentColor({ color: { main: accentColor } }).dark } }}>
          Explore
        </Button>
      </CardActions>
    </Card>
  );
}
export default SubjectOverviewCard;