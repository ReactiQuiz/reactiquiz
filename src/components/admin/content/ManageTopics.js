// src/components/admin/content/ManageTopics.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Skeleton, TextField, IconButton, Tooltip, CircularProgress,
  Grid, FormControl, InputLabel, Select, MenuItem, TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import apiClient from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationsContext';

function ManageTopics() {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]); // For dropdowns
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addNotification } = useNotifications();

  // State for filters
  const [filters, setFilters] = useState({ subject: 'all', class: 'all', genre: 'all' });

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for the "Add New Topic" form
  const [newTopic, setNewTopic] = useState({
    id: '', name: '', description: '', class: '', genre: '', subject_id: ''
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch topics and subjects concurrently
      const [topicsRes, subjectsRes] = await Promise.all([
        apiClient.get('/api/admin/topics'),
        apiClient.get('/api/admin/subjects')
      ]);
      setTopics(topicsRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to fetch content data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page to 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [filters]);

  // Memoized derived state for filters and filtered topics
  const { availableClasses, availableGenres, filteredTopics } = useMemo(() => {
    const allClasses = [...new Set(topics.map(t => t.class).filter(Boolean))].sort();
    const allGenres = [...new Set(topics.map(t => t.genre).filter(Boolean))].sort();

    const filtered = topics.filter(topic => {
        const subjectMatch = filters.subject === 'all' || topic.subject_id === filters.subject;
        const classMatch = filters.class === 'all' || topic.class === filters.class;
        const genreMatch = filters.genre === 'all' || topic.genre === filters.genre;
        return subjectMatch && classMatch && genreMatch;
    });

    return { availableClasses: allClasses, availableGenres: allGenres, filteredTopics: filtered };
  }, [topics, filters]);

  // Event Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInputChange = (e, id) => {
    const { name, value } = e.target;
    setTopics(prev =>
      prev.map(topic => (topic.id === id ? { ...topic, [name]: value } : topic))
    );
  };
  
  const handleNewTopicChange = (e) => {
      const { name, value } = e.target;
      setNewTopic(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // API Call Handlers
  const handleSaveChanges = async () => {
    setIsSaving(true);
    const updatePromises = topics.map(topic => apiClient.put(`/api/admin/topics/${topic.id}`, topic));
    try {
      await Promise.all(updatePromises);
      addNotification('All visible topics updated successfully!', 'success');
      setIsEditMode(false);
    } catch (error) {
      addNotification(error.response?.data?.message || 'An error occurred while saving', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTopic = async () => {
    setIsSaving(true);
    try {
      await apiClient.post('/api/admin/topics', newTopic);
      addNotification('New topic added successfully!', 'success');
      setNewTopic({ id: '', name: '', description: '', class: '', genre: '', subject_id: '' });
      fetchData(); // Refetch all topics to get the new one
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to add topic', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTopic = async (id) => {
    if (window.confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      try {
        await apiClient.delete(`/api/admin/topics/${id}`);
        addNotification('Topic deleted successfully', 'success');
        fetchData(); // Refetch to update the list
      } catch (error) {
        addNotification(error.response?.data?.message || 'Failed to delete topic', 'error');
      }
    }
  };
  
  const paginatedTopics = filteredTopics.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper variant="outlined">
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6">Manage Topics</Typography>
        <Box>
            {isEditMode && <Button variant="contained" startIcon={isSaving ? <CircularProgress size={20}/> : <SaveIcon/>} onClick={handleSaveChanges} disabled={isSaving} sx={{ mr: 1 }}>Save All</Button>}
            <Button variant={isEditMode ? 'outlined' : 'contained'} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? 'Done' : 'Edit'}
            </Button>
        </Box>
      </Box>
      
      <Grid container spacing={2} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
                <InputLabel>Subject</InputLabel>
                <Select name="subject" value={filters.subject} label="Subject" onChange={handleFilterChange}>
                    <MenuItem value="all">All Subjects</MenuItem>
                    {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
            </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select name="class" value={filters.class} label="Class" onChange={handleFilterChange}>
                    <MenuItem value="all">All Classes</MenuItem>
                    {availableClasses.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
            </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
                <InputLabel>Genre</InputLabel>
                <Select name="genre" value={filters.genre} label="Genre" onChange={handleFilterChange}>
                    <MenuItem value="all">All Genres</MenuItem>
                    {availableGenres.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
            </FormControl>
        </Grid>
      </Grid>
      
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{width: '25%'}}>Name</TableCell>
              <TableCell sx={{width: '15%'}}>Subject</TableCell>
              <TableCell sx={{width: '10%'}}>Class</TableCell>
              <TableCell sx={{width: '15%'}}>Genre</TableCell>
              <TableCell sx={{width: '25%'}}>ID</TableCell>
              {isEditMode && <TableCell align="right" sx={{width: '10%'}}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
                Array.from(new Array(rowsPerPage)).map((_, i) => <TableRow key={i}><TableCell colSpan={isEditMode ? 6 : 5}><Skeleton /></TableCell></TableRow>)
            ) : (
              paginatedTopics.map(topic => (
                <TableRow key={topic.id}>
                  <TableCell>
                    {isEditMode ? 
                      <TextField fullWidth size="small" variant="outlined" name="name" value={topic.name} onChange={e => handleInputChange(e, topic.id)} /> 
                      : topic.name}
                  </TableCell>
                  <TableCell>
                    {isEditMode ? (
                        <Select fullWidth size="small" variant="outlined" name="subject_id" value={topic.subject_id} onChange={e => handleInputChange(e, topic.id)}>
                            {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                        </Select>
                    ) : topic.subjectName}
                  </TableCell>
                  <TableCell>
                    {isEditMode ? 
                      <TextField size="small" variant="outlined" name="class" value={topic.class} onChange={e => handleInputChange(e, topic.id)} /> 
                      : topic.class}
                  </TableCell>
                  <TableCell>
                    {isEditMode ? 
                      <TextField size="small" variant="outlined" name="genre" value={topic.genre} onChange={e => handleInputChange(e, topic.id)} /> 
                      : topic.genre}
                  </TableCell>
                  <TableCell>
                    {isEditMode ? 
                      <TextField fullWidth size="small" variant="outlined" name="id" value={topic.id} disabled /> 
                      : <Typography variant="caption" sx={{bgcolor: 'action.hover', p: 0.5, borderRadius: 1, wordBreak: 'break-all'}}>{topic.id}</Typography>}
                  </TableCell>
                  {isEditMode && 
                    <TableCell align="right">
                      <Tooltip title="Delete Topic">
                        <IconButton size="small" color="error" onClick={() => handleDeleteTopic(topic.id)}><DeleteIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  }
                </TableRow>
              ))
            )}
            {isEditMode && (
                <TableRow sx={{bgcolor: 'action.hover'}}>
                     <TableCell><TextField fullWidth size="small" label="Name*" variant="outlined" name="name" value={newTopic.name} onChange={handleNewTopicChange}/></TableCell>
                     <TableCell>
                         <Select fullWidth size="small" displayEmpty variant="outlined" name="subject_id" value={newTopic.subject_id} onChange={handleNewTopicChange}>
                            <MenuItem value=""><em>Select Subject*</em></MenuItem>
                            {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                        </Select>
                     </TableCell>
                     <TableCell><TextField size="small" label="Class" variant="outlined" name="class" value={newTopic.class} onChange={handleNewTopicChange}/></TableCell>
                     <TableCell><TextField size="small" label="Genre" variant="outlined" name="genre" value={newTopic.genre} onChange={handleNewTopicChange}/></TableCell>
                     <TableCell><TextField fullWidth size="small" label="ID (slug)*" variant="outlined" name="id" value={newTopic.id} onChange={handleNewTopicChange}/></TableCell>
                     <TableCell align="right">
                        <Tooltip title="Add Topic">
                            <span>
                                <IconButton color="success" onClick={handleAddTopic} disabled={isSaving || !newTopic.name || !newTopic.id || !newTopic.subject_id}>
                                    <AddCircleIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                     </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredTopics.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </Paper>
  );
}

export default ManageTopics;