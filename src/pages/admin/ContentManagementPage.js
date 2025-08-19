// src/pages/admin/ContentManagementPage.js
import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import ManageSubjects from '../../components/admin/content/ManageSubjects';
import ManageTopics from '../../components/admin/content/ManageTopics'; // <-- IMPORT

function ContentManagementPage() {
  // --- START OF CHANGE: Add state and handler for tabs ---
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  // --- END OF CHANGE ---

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Content Management
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        {/* --- START OF CHANGE: Enable tab interaction --- */}
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="content management tabs">
          <Tab label="Subjects" id="tab-0" />
          <Tab label="Topics" id="tab-1" />
          <Tab label="Questions" id="tab-2" disabled />
        </Tabs>
        {/* --- END OF CHANGE --- */}
      </Box>

      {/* --- START OF CHANGE: Add panel for Topics tab --- */}
      {tabValue === 0 && <ManageSubjects />}
      {tabValue === 1 && <ManageTopics />}
      {/* --- END OF CHANGE --- */}
    </Box>
  );
}

export default ContentManagementPage;