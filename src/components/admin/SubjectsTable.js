// src/components/admin/SubjectsTable.js
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Skeleton, Chip
} from '@mui/material';
import apiClient from '../../api/axiosInstance';

function SubjectsTable() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      try {
        // We can reuse the public /api/subjects endpoint as it has all the data we need.
        const response = await apiClient.get('/api/subjects');
        setSubjects(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch subjects data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <Paper variant="outlined">
      {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Subject Key</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Display Order</TableCell>
              <TableCell>Icon Name</TableCell>
              <TableCell>Accent Colors (Dark/Light)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : (
              subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell sx={{ fontWeight: 500 }}>{subject.name}</TableCell>
                  <TableCell>
                    <Chip label={subject.subjectKey} size="small" />
                  </TableCell>
                  <TableCell>{subject.description}</TableCell>
                  <TableCell align="center">{subject.displayOrder}</TableCell>
                  <TableCell>{subject.iconName}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 20, height: 20, bgcolor: subject.accentColorDark, borderRadius: '4px', border: '1px solid #fff' }} />
                        <Box sx={{ width: 20, height: 20, bgcolor: subject.accentColorLight, borderRadius: '4px', border: '1px solid #333' }} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default SubjectsTable;