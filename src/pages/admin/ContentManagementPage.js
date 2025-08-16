// src/pages/admin/ContentManagementPage.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Skeleton,
  TableSortLabel, TextField, InputAdornment, Grid, Chip,
  FormControl, InputLabel, Select, MenuItem, Divider, TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import apiClient from '../../api/axiosInstance';

function ContentManagementPage() {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering and Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'subjectName', direction: 'asc' });
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch topics and subjects data in parallel
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };

  const filteredAndSortedTopics = useMemo(() => {
    let filtered = [...topics];

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(topic => topic.subjectName === subjectFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortConfig.key === 'class') {
        const classA = parseInt(a.class) || 0;
        const classB = parseInt(b.class) || 0;
        if (classA < classB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (classA > classB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [topics, searchTerm, subjectFilter, sortConfig]);

  const paginatedTopics = filteredAndSortedTopics.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        Content Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* --- Topics Section --- */}
      <Paper variant="outlined" sx={{ mb: 4 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Topics Overview</Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search by Topic Name"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
            sx={{ flexGrow: 1, minWidth: '250px' }}
          />
          <FormControl size="small" sx={{ minWidth: '200px' }}>
            <InputLabel>Filter by Subject</InputLabel>
            <Select
              value={subjectFilter}
              label="Filter by Subject"
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <MenuItem value="all">All Subjects</MenuItem>
              {subjects.map(s => <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel active={sortConfig.key === 'name'} direction={sortConfig.key === 'name' ? sortConfig.direction : 'asc'} onClick={() => handleSort('name')}>Topic Name</TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortConfig.key === 'subjectName'} direction={sortConfig.key === 'subjectName' ? sortConfig.direction : 'asc'} onClick={() => handleSort('subjectName')}>Subject</TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel active={sortConfig.key === 'class'} direction={sortConfig.key === 'class' ? sortConfig.direction : 'asc'} onClick={() => handleSort('class')}>Class</TableSortLabel>
                </TableCell>
                <TableCell>Genre</TableCell>
                <TableCell align="center">
                  <TableSortLabel active={sortConfig.key === 'totalQuestions'} direction={sortConfig.key === 'totalQuestions' ? sortConfig.direction : 'asc'} onClick={() => handleSort('totalQuestions')}>Total Qs</TableSortLabel>
                </TableCell>
                <TableCell align="center">Easy</TableCell>
                <TableCell align="center">Medium</TableCell>
                <TableCell align="center">Hard</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from(new Array(5)).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={8}><Skeleton /></TableCell></TableRow>
                ))
              ) : (
                paginatedTopics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell sx={{ fontWeight: 500 }}>{topic.name}</TableCell>
                    <TableCell>{topic.subjectName}</TableCell>
                    <TableCell align="center">{topic.class || '-'}</TableCell>
                    <TableCell>{topic.genre || '-'}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>{topic.totalQuestions}</TableCell>
                    <TableCell align="center" sx={{ color: 'success.main' }}>{topic.easyCount}</TableCell>
                    <TableCell align="center" sx={{ color: 'warning.main' }}>{topic.mediumCount}</TableCell>
                    <TableCell align="center" sx={{ color: 'error.main' }}>{topic.hardCount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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

      {/* --- Subjects Section --- */}
      <Typography variant="h5" sx={{ mb: 2 }}>Subjects Summary</Typography>
      <Grid container spacing={3}>
        {isLoading ? (
          Array.from(new Array(4)).map((_, i) => (
            <Grid item xs={12} md={6} key={i}><Skeleton variant="rectangular" height={150} /></Grid>
          ))
        ) : (
          subjects.map(subject => (
            <Grid item xs={12} md={6} key={subject.id}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>{subject.name}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>Total Topics: <strong>{subject.totalTopics}</strong></Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.entries(subject.classCounts).map(([cls, count]) => (
                    <Chip key={cls} label={`Class ${cls}: ${count}`} size="small" />
                  ))}
                  {Object.entries(subject.genreCounts).map(([genre, count]) => (
                    <Chip key={genre} label={`${genre}: ${count}`} size="small" variant="outlined" />
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}

export default ContentManagementPage;