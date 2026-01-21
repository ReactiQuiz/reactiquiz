// src/pages/NotFoundPage.tsx
/**
 * Not Found Page (404)
 * 
 * This page is displayed when a user navigates to a route that
 * doesn't exist. Provides a friendly error message and navigation
 * back to the home page.
 */
import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

/**
 * Not Found Page Component
 * 
 * Displays 404 error page with:
 * - Error icon (report problem)
 * - 404 error message
 * - Friendly explanation text
 * - Home button for navigation
 * - Centered layout
 * - Responsive design
 * 
 * This page is accessible to all users and is shown when
 * navigating to non-existent routes.
 * 
 * @returns {JSX.Element} 404 not found page
 */
const NotFoundPage: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 128px)', // Adjust based on Navbar/Footer height
        textAlign: 'center',
        p: 3,
      }}
    >
      <Paper elevation={3} sx={{ p: {xs: 3, sm: 5}, maxWidth: '500px', width: '100%' }}>
        <ReportProblemIcon sx={{ fontSize: 60, color: theme.palette.error.main, mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 'bold'}}>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Oops! The page you are looking for does not exist or may have been moved.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/"
          size="large"
        >
          Go to Homepage
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;