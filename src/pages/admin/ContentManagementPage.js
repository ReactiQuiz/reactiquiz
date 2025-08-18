// src/pages/admin/ContentManagementPage.js
import React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import ManageSubjects from '../../components/admin/content/ManageSubjects'; // We will create this

function ContentManagementPage() {
  // For now, we only have one tab. This structure allows for easy expansion.
  const [tabValue, setTabValue] = React.useState(0);

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Content Management
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} aria-label="content management tabs">
          <Tab label="Subjects" id="tab-0" />
          <Tab label="Topics" id="tab-1" disabled />
          <Tab label="Questions" id="tab-2" disabled />
        </Tabs>
      </Box>

      {/* Panel for Subjects */}
      {tabValue === 0 && (
        <ManageSubjects />
      )}
    </Box>
  );
}

export default ContentManagementPage;