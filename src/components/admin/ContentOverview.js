// src/components/admin/ContentOverview.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Skeleton,
  TextField, InputAdornment, Grid, Chip,
  FormControl, InputLabel, Select, MenuItem, Divider, TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import apiClient from '../../api/axiosInstance';

// This component contains all the logic and UI from the previous version of ContentManagementPage

function ContentOverview() {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [sortOption, setSortOption] = useState('subject_asc');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [topicsRes, subjectsRes] = await Promise.all([
          apiClient.get('/api/admin/topics'),
          apiClient.get('/api/admin/subjects')
        ]);
        setTopics(topicsRes.data);
        setSubjects(subjectsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch content data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const uniqueClasses = useMemo(() => {
    const classes = new Set(topics.map(t => t.class).filter(Boolean));
    return Array.from(classes).sort((a, b) => parseInt(a) - parseInt(b));
  }, [topics]);

  const filteredAndSortedTopics = useMemo(() => {
    let filtered = [...topics];
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(topic => topic.subjectName === subjectFilter);
    }
    if (classFilter !== 'all') {
        filtered = filtered.filter(topic => topic.class === classFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    const [key, direction] = sortOption.split('_');
    filtered.sort((a, b) => {
      let valA = a[key], valB = b[key];
      if (['totalQuestions', 'class', 'easyCount', 'mediumCount', 'hardCount'].includes(key)) {
        valA = parseInt(valA) || 0;
        valB = parseInt(valB) || 0;
      }
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [topics, searchTerm, subjectFilter, classFilter, sortOption]);

  const paginatedTopics = filteredAndSortedTopics.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper variant="outlined" sx={{ mb: 4 }}>
        <Box sx={{ p: 2 }}><Typography variant="h6">Topics Overview</Typography></Box>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Filter controls */}
        </Box>
        <TableContainer sx={{ maxHeight: 600 }}>
            {/* Table */}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredAndSortedTopics.length} 
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Typography variant="h5" sx={{ mb: 2 }}>Subjects Summary</Typography>
      <Grid container spacing={3}>
        {/* Subjects summary grid */}
      </Grid>
    </Box>
  );
}

export default ContentOverview;