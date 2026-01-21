// src/components/topics/SubjectOverviewCard.tsx
/**
 * Subject Overview Card Component
 * 
 * This component displays a card with subject information and an
 * explore button. It shows the subject icon, name, description,
 * and provides navigation to the subject's topics page.
 */
import { Card, CardContent, Typography, CardActions, Button, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getIconComponent } from '../../utils/getIconComponent';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';

/**
 * Subject Overview Card Component
 * 
 * Displays a subject overview card with:
 * - Subject icon (from icon name)
 * - Subject name
 * - Subject description
 * - Explore button with navigation
 * - Subject-specific accent color
 * 
 * This component is used on the AllSubjectsPage to display
 * each subject in a grid layout.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.subject - Subject object with name, description, iconName, subjectKey
 * @param {(subjectKey: string) => void} props.onExploreClick - Callback to navigate to subject topics
 * @returns {JSX.Element} Subject overview card
 */
function SubjectOverviewCard({ subject, onExploreClick }) {
  // Get theme for styling
  const theme = useTheme();
  // Get subject colors from context
  const { getColor } = useSubjectColors();
  // Get icon component for subject
  const IconComponent = getIconComponent(subject.iconName);
  // Get accent color for subject
  const accentColor = getColor(subject.subjectKey);
  // Get contrasting text color for button
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