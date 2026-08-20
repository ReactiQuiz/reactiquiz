// src/components/topics/SubjectBreadcrumb.tsx
/**
 * Subject Breadcrumb Component
 * 
 * This component displays a breadcrumb navigation for subject pages.
 * It shows "Subjects > [Subject Name]" with navigation back to
 * the subjects listing page.
 */
import { Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * Subject Breadcrumb Component
 * 
 * Displays a breadcrumb navigation path. Features:
 * - Link back to subjects page
 * - Separator icon (chevron)
 * - Current subject name with accent color
 * 
 * This component is used on the SubjectTopicsPage to show
 * navigation hierarchy and allow quick return to subjects.
 * 
 * @param {Object} props - Component props
 * @param {string} props.subjectDisplayName - Display name of the current subject
 * @param {string} props.accentColor - Accent color for current subject name
 * @returns {JSX.Element} Breadcrumb navigation component
 */
function SubjectBreadcrumb({ subjectDisplayName, accentColor }) {
  return (
    <Typography color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
      {/* Link to Subjects Page */}
      <RouterLink to="/subjects" style={{ textDecoration: 'none', color: 'inherit' }}>
        Subjects
      </RouterLink>
      
      {/* Breadcrumb Separator */}
      <NavigateNextIcon fontSize="small" sx={{ mx: 0.5 }} />
      
      {/* Current Subject Name - Highlighted with accent color */}
      <Typography component="span" sx={{ color: accentColor, fontWeight: 'medium' }}>
        {subjectDisplayName}
      </Typography>
    </Typography>
  );
}

export default SubjectBreadcrumb;
