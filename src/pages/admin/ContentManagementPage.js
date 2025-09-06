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
          <Tab label="Subjects" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Topics" id="tab-1" aria-controls="tabpanel-1" />
          <Tab label="Questions" id="tab-2" aria-controls="tabpanel-2" />
        </Tabs>
      </Box>

      {tabValue === 0 && <Box id="tabpanel-0" role="tabpanel" aria-labelledby="tab-0"><ManageSubjects /></Box>}
      {tabValue === 1 && <Box id="tabpanel-1" role="tabpanel" aria-labelledby="tab-1"><ManageTopics /></Box>}
      {tabValue === 2 && <Box id="tabpanel-2" role="tabpanel" aria-labelledby="tab-2"><ManageQuestions /></Box>}
    </Box>
  );
}

export default ContentManagementPage;