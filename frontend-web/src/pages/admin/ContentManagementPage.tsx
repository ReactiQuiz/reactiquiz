// src/pages/admin/ContentManagementPage.tsx
/**
 * Content Management Page
 * 
 * This page provides a tabbed interface for managing all content
 * in the system: subjects, topics, and questions. It's the main
 * content administration interface for admins.
 */
import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import ManageSubjects from '../../components/admin/content/ManageSubjects';
import ManageTopics from '../../components/admin/content/ManageTopics';
import ManageQuestions from '../../components/admin/content/ManageQuestions';

/**
 * Content Management Page Component
 * 
 * Displays content management interface with:
 * - Tabbed navigation (Subjects, Topics, Questions)
 * - Manage Subjects tab (CRUD operations)
 * - Manage Topics tab (CRUD operations with filters)
 * - Manage Questions tab (topic-based question management)
 * - Tab state management
 * - Accessible tab panels with ARIA labels
 * 
 * This page is only accessible to admin users. Provides
 * comprehensive content management capabilities.
 * 
 * @returns {JSX.Element} Content management page with tabs
 */
function ContentManagementPage() {
  const [tabValue, setTabValue] = useState(0);

  /**
   * Handle Tab Change
   * 
   * Updates the active tab when user clicks a different tab.
   * 
   * @param {any} event - Change event
   * @param {number} newValue - New tab index
   */
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