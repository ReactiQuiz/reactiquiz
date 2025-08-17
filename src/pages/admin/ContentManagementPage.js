// src/pages/admin/ContentManagementPage.js
import React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

function ContentManagementPage() {
  const location = useLocation();

  // Determine the current tab value based on the URL
  const currentTab = location.pathname;

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Content Management
      </Typography>

      {/* --- Tab Navigation --- */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab}>
          <Tab
            label="Overview"
            value="/admin/content/overview"
            component={NavLink}
            to="overview"
          />
          <Tab
            label="Subjects"
            value="/admin/content/subjects"
            component={NavLink}
            to="subjects"
          />
          <Tab label="Topics" disabled />
          <Tab label="Questions" disabled />
        </Tabs>
      </Box>

      {/* --- Tab Content --- */}
      {/* React Router's <Outlet> will render the component for the active nested route */}
      <Outlet />
    </Box>
  );
}

export default ContentManagementPage;