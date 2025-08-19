// src/components/admin/content/TopicSummaryList.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Skeleton, LinearProgress, Tooltip
} from '@mui/material';
import apiClient from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationsContext';
import JsonImportModal from './JsonImportModal';

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