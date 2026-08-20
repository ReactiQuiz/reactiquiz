// src/pages/admin/ContentManagementPage.tsx
/**
 * Content Management Page
 * 
 * This page provides a tabbed interface for managing all content
 * in the system: subjects, topics, and questions. It's the main
 * content administration interface for admins.
 */
import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import ManageSubjects from '../../components/admin/content/ManageSubjects';
import ManageTopics from '../../components/admin/content/ManageTopics';
import ManageQuestions from '../../components/admin/content/ManageQuestions';
import ManageNotes from '../../components/admin/content/ManageNotes';

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
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem' }, mb: 3 }}>
        Content management
      </Typography>
      <Paper
        sx={{
          borderRadius: 2,
          p: 0.5,
          mb: 3,
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="content management tabs"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              transition: 'all 150ms ease',
            }
          }}
        >
          <Tab label="Subjects" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Topics" id="tab-1" aria-controls="tabpanel-1" />
          <Tab label="Questions" id="tab-2" aria-controls="tabpanel-2" />
          <Tab label="Chapter Notes" id="tab-3" aria-controls="tabpanel-3" />
        </Tabs>
      </Paper>

      {tabValue === 0 && <Box id="tabpanel-0" role="tabpanel" aria-labelledby="tab-0"><ManageSubjects /></Box>}
      {tabValue === 1 && <Box id="tabpanel-1" role="tabpanel" aria-labelledby="tab-1"><ManageTopics /></Box>}
      {tabValue === 2 && <Box id="tabpanel-2" role="tabpanel" aria-labelledby="tab-2"><ManageQuestions /></Box>}
      {tabValue === 3 && <Box id="tabpanel-3" role="tabpanel" aria-labelledby="tab-3"><ManageNotes /></Box>}
    </Box>
  );
}

export default ContentManagementPage;