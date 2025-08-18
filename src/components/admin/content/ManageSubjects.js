// src/components/admin/content/ManageSubjects.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Skeleton, TextField, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import apiClient from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationsContext';

function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addNotification } = useNotifications();

  // State for the "Add New Subject" form
  const [newSubject, setNewSubject] = useState({
    name: '', subjectKey: '', description: '', displayOrder: '',
    iconName: 'DefaultIcon', accentColorDark: '#FFFFFF', accentColorLight: '#000000'
  });

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/admin/subjects');
      setSubjects(response.data);
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to fetch subjects', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleInputChange = (e, id) => {
    const { name, value } = e.target;
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === id ? { ...subject, [name]: value } : subject
      )
    );
  };
  
  const handleNewSubjectChange = (e) => {
      const { name, value } = e.target;
      setNewSubject(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Use Promise.all to send all update requests concurrently
    const updatePromises = subjects.map(subject => apiClient.put(`/api/admin/subjects/${subject.id}`, subject));
    try {
      await Promise.all(updatePromises);
      addNotification('All subjects updated successfully!', 'success');
      setIsEditMode(false);
    } catch (error) {
      addNotification(error.response?.data?.message || 'An error occurred while saving', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubject = async () => {
      setIsSaving(true);
      try {
          await apiClient.post('/api/admin/subjects', newSubject);
          addNotification('New subject added successfully!', 'success');
          setNewSubject({ name: '', subjectKey: '', description: '', displayOrder: '', iconName: 'DefaultIcon', accentColorDark: '#FFFFFF', accentColorLight: '#000000' });
          fetchSubjects(); // Refetch all subjects to get the new one
      } catch (error) {
          addNotification(error.response?.data?.message || 'Failed to add subject', 'error');
      } finally {
          setIsSaving(false);
      }
  };
  
  const handleDeleteSubject = async (id) => {
      if (window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
        try {
            await apiClient.delete(`/api/admin/subjects/${id}`);
            addNotification('Subject deleted successfully', 'success');
            fetchSubjects(); // Refetch to update the list
        } catch (error) {
            addNotification(error.response?.data?.message || 'Failed to delete subject', 'error');
        }
      }
  };

  return (
    <Paper variant="outlined">
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Manage Subjects</Typography>
        <Box>
            {isEditMode && (
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    sx={{ mr: 1 }}
                >
                    Save All
                </Button>
            )}
            <Button
                variant={isEditMode ? 'outlined' : 'contained'}
                onClick={() => setIsEditMode(!isEditMode)}
            >
                {isEditMode ? 'Done' : 'Edit'}
            </Button>
        </Box>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Subject Key</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Icon Name</TableCell>
              <TableCell>Accent Colors</TableCell>
              {isEditMode && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
                Array.from(new Array(5)).map((_, i) => <TableRow key={i}><TableCell colSpan={7}><Skeleton /></TableCell></TableRow>)
            ) : (
              subjects.map(subject => (
                <TableRow key={subject.id}>
                  <TableCell>{isEditMode ? <TextField size="small" variant="standard" name="name" value={subject.name} onChange={(e) => handleInputChange(e, subject.id)} /> : subject.name}</TableCell>
                  <TableCell>{isEditMode ? <TextField size="small" variant="standard" name="subjectKey" value={subject.subjectKey} onChange={(e) => handleInputChange(e, subject.id)} /> : <Typography variant="caption" sx={{bgcolor: 'action.hover', p: 0.5, borderRadius: 1}}>{subject.subjectKey}</Typography>}</TableCell>
                  <TableCell>{isEditMode ? <TextField size="small" variant="standard" fullWidth name="description" value={subject.description} onChange={(e) => handleInputChange(e, subject.id)} /> : subject.description}</TableCell>
                  <TableCell>{isEditMode ? <TextField size="small" variant="standard" type="number" name="displayOrder" value={subject.displayOrder} sx={{width: 60}} onChange={(e) => handleInputChange(e, subject.id)} /> : subject.displayOrder}</TableCell>
                  <TableCell>{isEditMode ? <TextField size="small" variant="standard" name="iconName" value={subject.iconName} onChange={(e) => handleInputChange(e, subject.id)} /> : subject.iconName}</TableCell>
                  <TableCell>
                    {isEditMode ? (
                        <Box sx={{display: 'flex', gap: 1}}>
                            <TextField size="small" label="Dark" variant="standard" name="accentColorDark" value={subject.accentColorDark} onChange={(e) => handleInputChange(e, subject.id)} />
                            <TextField size="small" label="Light" variant="standard" name="accentColorLight" value={subject.accentColorLight} onChange={(e) => handleInputChange(e, subject.id)} />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 16, height: 16, bgcolor: subject.accentColorDark, border: '1px solid white' }} />
                            <Box sx={{ width: 16, height: 16, bgcolor: subject.accentColorLight, border: '1px solid black' }} />
                        </Box>
                    )}
                  </TableCell>
                  {isEditMode && <TableCell align="right"><Tooltip title="Delete Subject"><IconButton size="small" color="error" onClick={() => handleDeleteSubject(subject.id)}><DeleteIcon /></IconButton></Tooltip></TableCell>}
                </TableRow>
              ))
            )}
            {isEditMode && (
                <TableRow sx={{bgcolor: 'action.hover'}}>
                     <TableCell><TextField size="small" label="Name*" variant="filled" name="name" value={newSubject.name} onChange={handleNewSubjectChange}/></TableCell>
                     <TableCell><TextField size="small" label="Subject Key*" variant="filled" name="subjectKey" value={newSubject.subjectKey} onChange={handleNewSubjectChange}/></TableCell>
                     <TableCell><TextField size="small" label="Description" variant="filled" name="description" value={newSubject.description} onChange={handleNewSubjectChange}/></TableCell>
                     <TableCell><TextField size="small" label="Order*" type="number" variant="filled" name="displayOrder" value={newSubject.displayOrder} onChange={handleNewSubjectChange} sx={{width: 80}}/></TableCell>
                     <TableCell><TextField size="small" label="Icon Name" variant="filled" name="iconName" value={newSubject.iconName} onChange={handleNewSubjectChange}/></TableCell>
                     <TableCell>
                        <Box sx={{display: 'flex', gap: 1}}>
                            <TextField size="small" label="Dark Color" variant="filled" name="accentColorDark" value={newSubject.accentColorDark} onChange={handleNewSubjectChange}/>
                            <TextField size="small" label="Light Color" variant="filled" name="accentColorLight" value={newSubject.accentColorLight} onChange={handleNewSubjectChange}/>
                        </Box>
                     </TableCell>
                     <TableCell align="right"><Tooltip title="Add Subject"><IconButton color="success" onClick={handleAddSubject} disabled={isSaving}><AddCircleIcon /></IconButton></Tooltip></TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default ManageSubjects;