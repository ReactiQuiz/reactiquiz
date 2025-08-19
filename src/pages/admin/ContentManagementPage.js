// src/pages/admin/ContentManagementPage.js
import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import ManageSubjects from '../../components/admin/content/ManageSubjects';
import ManageTopics from '../../components/admin/content/ManageTopics';
import ManageQuestions from '../../components/admin/content/ManageQuestions'; // <-- IMPORT

function ContentManagementPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Content Management
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="content management tabs">
          <Tab label="Subjects" id="tab-0" />
          <Tab label="Topics" id="tab-1" />
          <Tab label="Questions" id="tab-2" />
        </Tabs>
      </Box>

      {tabValue === 0 && <ManageSubjects />}
      {tabValue === 1 && <ManageTopics />}
      {tabValue === 2 && <ManageQuestions />}
    </Box>
  );
}

export default ContentManagementPage;