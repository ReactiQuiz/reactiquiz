// src/pages/admin/ContentManagementPage.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Skeleton,
  TextField, InputAdornment, Grid, Chip,
  FormControl, InputLabel, Select, MenuItem, Divider, TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import apiClient from '../../api/axiosInstance';

function ContentManagementPage() {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- START OF REFINED STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all'); // New state for class filter
  const [sortOption, setSortOption] = useState('subject_asc'); // New state for sorting
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // --- END OF REFINED STATE ---

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
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

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
    
    // --- START: Add Class Filter Logic ---
    if (classFilter !== 'all') {
        filtered = filtered.filter(topic => topic.class === classFilter);
    }
    // --- END: Add Class Filter Logic ---

    if (searchTerm) {
      filtered = filtered.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // --- START: Refined Sorting Logic ---
    const [key, direction] = sortOption.split('_');

    filtered.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      // Handle numeric sorting for specific keys
      if (['totalQuestions', 'class', 'easyCount', 'mediumCount', 'hardCount'].includes(key)) {
        valA = parseInt(valA) || 0;
        valB = parseInt(valB) || 0;
      }
      
      // Handle string sorting (case-insensitive)
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    // --- END: Refined Sorting Logic ---

    return filtered;
  }, [topics, searchTerm, subjectFilter, classFilter, sortOption]);

  const paginatedTopics = filteredAndSortedTopics.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        Content Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ mb: 4 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Topics Overview</Typography>
        </Box>
        <Divider />
        {/* --- START: Updated Filter Controls --- */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Subject</InputLabel>
            <Select
              value={subjectFilter}
              label="Filter by Subject"
              onChange={(e) => { setSubjectFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="all">All Subjects</MenuItem>
              {subjects.map(s => <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Class</InputLabel>
            <Select
              value={classFilter}
              label="Filter by Class"
              onChange={(e) => { setClassFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="all">All Classes</MenuItem>
              {uniqueClasses.map(c => <MenuItem key={c} value={c}>Class {c}</MenuItem>)}
            </Select>
          </FormControl>
           <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOption}
              label="Sort By"
              onChange={(e) => setSortOption(e.target.value)}
            >
              <MenuItem value="subject_asc">Subject (A-Z)</MenuItem>
              <MenuItem value="name_asc">Topic Name (A-Z)</MenuItem>
              <MenuItem value="class_asc">Class (Low to High)</MenuItem>
              <MenuItem value="class_desc">Class (High to Low)</MenuItem>
              <MenuItem value="totalQuestions_desc">Total Questions (High to Low)</MenuItem>
              <MenuItem value="totalQuestions_asc">Total Questions (Low to High)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {/* --- END: Updated Filter Controls --- */}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              {/* --- START: Simplified Static Headers --- */}
              <TableRow>
                <TableCell>Topic Name</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell align="center">Class</TableCell>
                <TableCell>Genre</TableCell>
                <TableCell align="center">Total Qs</TableCell>
                <TableCell align="center">Easy</TableCell>
                <TableCell align="center">Medium</TableCell>
                <TableCell align="center">Hard</TableCell>
              </TableRow>
              {/* --- END: Simplified Static Headers --- */}
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from(new Array(10)).map((_, i) => (
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