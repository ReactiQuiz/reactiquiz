// src/components/topics/SubjectBreadcrumb.js
import { Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function SubjectBreadcrumb({ subjectDisplayName, accentColor }) {
  return (
    <Typography color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
      <RouterLink to="/subjects" style={{ textDecoration: 'none', color: 'inherit' }}>
        Subjects
      </RouterLink>
      <NavigateNextIcon fontSize="small" sx={{ mx: 0.5 }} />
      <Typography component="span" sx={{ color: accentColor, fontWeight: 'medium' }}>
        {subjectDisplayName}
      </Typography>
    </Typography>
  );
}

export default SubjectBreadcrumb;
