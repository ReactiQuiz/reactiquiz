// src/components/SubjectOverviewCard.js
import { Card, CardContent, Typography, Button, useTheme, alpha, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getIconComponent } from '../utils/getIconComponent';

function SubjectOverviewCard({ subject, onExploreClick }) {
  const theme = useTheme();
  const { id, name, description, accentColor, iconName, displayOrder, subjectKey } = subject;
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
    height: '100%',
    width: '100%',
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
  };

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: {xs:2, sm:3}, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <IconComponent sx={{ fontSize: {xs: 40, sm: 50}, color: accentColor, mb: 1.5 }} />
        <Typography
          variant="h5"
          component="div"
          gutterBottom
          sx={{ fontWeight: 'bold', color: accentColor, fontSize: {xs:'1.1rem', sm:'1.3rem'} }}
        >
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, fontSize: {xs:'0.85rem', sm:'0.9rem'} }}>
          {description}
        </Typography>
      </CardContent>
      <Box sx={{ p: {xs:1.5, sm:2}, pt:0, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => onExploreClick(subjectKey)} // Use subjectKey for navigation
          endIcon={<ArrowForwardIcon />}
          sx={{
            backgroundColor: accentColor,
            color: theme.palette.getContrastText(accentColor),
            '&:hover': { backgroundColor: theme.palette.augmentColor({ color: { main: accentColor } }).dark },
            width: '100%',
            py: 1
          }}
        >
          Explore
        </Button>
      </Box>
    </Card>
  );
}

export default SubjectOverviewCard;