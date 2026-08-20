// src/components/admin/content/TopicSummaryList.tsx
/**
 * Topic Summary List Component
 * 
 * This component displays a list of topic summaries with question
 * counts and difficulty breakdowns. It allows selecting a topic
 * to view detailed questions and includes JSON import functionality.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Skeleton
} from '@mui/material';
import apiClient from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationsContext';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BulkImportModal from './BulkImportModal';

function TopicSummaryList({ onSelectTopic }) {
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const { addNotification } = useNotifications();

  const fetchSummaries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/admin/topics/summary');
      setSummaries(response.data);
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to fetch topic summaries', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  return (
    <>
      <Paper variant="outlined">
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Manage Questions by Topic</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadFileIcon />}
              onClick={() => setImportModalOpen(true)}
            >
              Bulk Import
            </Button>
          </Box>
        </Box>

        <BulkImportModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          entityType="questions"
          onImportSuccess={fetchSummaries}
        />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{width: '45%'}}>Topic Name</TableCell>
                <TableCell sx={{width: '35%'}}>Subject</TableCell>
                <TableCell align="center" sx={{width: '20%'}}>Total Questions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                  Array.from(new Array(8)).map((_, i) => <TableRow key={i}><TableCell colSpan={3}><Skeleton /></TableCell></TableRow>)
              ) : (
                summaries.map(topic => (
                  <TableRow 
                    key={topic.id} 
                    hover 
                    onClick={() => onSelectTopic(topic)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{topic.name}</TableCell>
                    <TableCell>{topic.subjectName}</TableCell>
                    <TableCell align="center">{topic.questionCount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}

export default TopicSummaryList;