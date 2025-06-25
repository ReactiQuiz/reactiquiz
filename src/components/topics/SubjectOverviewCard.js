// src/components/SubjectOverviewCard.js
// ... (imports) ...
import { Card, CardContent, Typography, Button, useTheme, alpha, Box } from '@mui/material'; // Ensure Box is imported if used
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getIconComponent } from '../../utils/getIconComponent';


function SubjectOverviewCard({ subject, onExploreClick }) {
  const theme = useTheme();
  const { name, description, accentColor, iconName } = subject; // Removed id, displayOrder, subjectKey as they are not directly used in THIS component's rendering
  const IconComponent = getIconComponent(iconName);

  const cardStyle = {
    border: `2px solid ${alpha(accentColor, 0.7)}`,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[3],
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.shadows[8],
    },
    display: 'flex',
    flexDirection: 'column',
    height: '100%', // To ensure all cards in a row can align if heights vary due to content
    width: '100%',   // Card fills the Grid item or Box wrapper
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
  };

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: {xs:2, sm:2.5}, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}> {/* Adjusted padding slightly */}
        <IconComponent sx={{ fontSize: {xs: 36, sm: 44}, color: accentColor, mb: 1.5 }} /> {/* Adjusted icon size */}
        <Typography
          variant="h6" // Changed from h5 for potentially better fit with fixed width
          component="div"
          gutterBottom
          sx={{ fontWeight: 'bold', color: accentColor, fontSize: {xs:'1rem', sm:'1.15rem'} }}
        >
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, fontSize: {xs:'0.8rem', sm:'0.875rem'}, lineHeight: 1.5 }}>
          {description}
        </Typography>
      </CardContent>
      <Box sx={{ p: {xs:1.5, sm:2}, pt:0, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => onExploreClick(subject.subjectKey)} // Pass subjectKey
          endIcon={<ArrowForwardIcon />}
          sx={{
            backgroundColor: accentColor,
            color: theme.palette.getContrastText(accentColor),
            '&:hover': { backgroundColor: theme.palette.augmentColor({ color: { main: accentColor } }).dark },
            width: '100%', // Button takes full width of its Box container
            py: 0.8, // Adjusted padding
            fontSize: {xs: '0.8rem', sm: '0.875rem'}
          }}
        >
          Explore
        </Button>
      </Box>
    </Card>
  );
}

export default SubjectOverviewCard;