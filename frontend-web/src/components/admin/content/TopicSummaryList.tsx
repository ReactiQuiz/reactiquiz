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
  TableHead, TableRow, Skeleton, Tooltip
} from '@mui/material';
import apiClient from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationsContext';
import JsonImportModal from './JsonImportModal';

/**
 * Difficulty Bar Component
 * 
 * Displays a horizontal bar showing difficulty breakdown.
 * Colors: green (easy), yellow (medium), red (hard).
 * 
 * @param {Object} props - Component props
 * @param {number} props.easy - Number of easy questions
 * @param {number} props.medium - Number of medium questions
 * @param {number} props.hard - Number of hard questions
 * @param {number} props.total - Total number of questions
 * @returns {JSX.Element} Difficulty breakdown bar
 */
const DifficultyBar = ({ easy, medium, hard, total }) => {
    if (total === 0) return null;
    const easyWidth = (easy / total) * 100;
    const mediumWidth = (medium / total) * 100;
    const hardWidth = (hard / total) * 100;
    return (
        <Tooltip title={`Easy: ${easy}, Medium: ${medium}, Hard: ${hard}`}>
            <Box sx={{ display: 'flex', height: 8, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                <Box sx={{ width: `${easyWidth}%`, bgcolor: 'success.main' }} />
                <Box sx={{ width: `${mediumWidth}%`, bgcolor: 'warning.main' }} />
                <Box sx={{ width: `${hardWidth}%`, bgcolor: 'error.main' }} />
            </Box>
        </Tooltip>
    );
};

/**
 * Topic Summary List Component
 * 
 * Displays a list of topic summaries with:
 * - Topic name and subject
 * - Total question count
 * - Difficulty breakdown bar (easy/medium/hard)
 * - Click navigation to question detail view
 * - JSON import button and modal
 * - Loading skeleton states
 * - Tooltips for difficulty breakdown
 * 
 * This component is used in ManageQuestions to display
 * an overview of all topics with their question statistics.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSelectTopic - Callback when topic is selected
 * @returns {JSX.Element} Topic summary list table
 */
function TopicSummaryList({ onSelectTopic }) {
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Manage Questions by Topic</Typography>
          <Button variant="contained" onClick={() => setIsImportModalOpen(true)}>
            Import from JSON
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{width: '30%'}}>Topic Name</TableCell>
                <TableCell sx={{width: '20%'}}>Subject</TableCell>
                <TableCell align="center" sx={{width: '10%'}}>Total Qs</TableCell>
                <TableCell sx={{width: '40%'}}>Difficulty Breakdown</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                  Array.from(new Array(10)).map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton /></TableCell></TableRow>)
              ) : (
                summaries.map(topic => (
                  <TableRow 
                    key={topic.id} 
                    hover 
                    onClick={() => onSelectTopic(topic)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{topic.name}</TableCell>
                    <TableCell>{topic.subjectName}</TableCell>
                    <TableCell align="center">{topic.questionCount}</TableCell>
                    <TableCell>
                        <DifficultyBar 
                            easy={topic.easyCount} 
                            medium={topic.mediumCount} 
                            hard={topic.hardCount} 
                            total={topic.questionCount}
                        />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <JsonImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchSummaries} // Refresh list on successful import
      />
    </>
  );
}

export default TopicSummaryList;