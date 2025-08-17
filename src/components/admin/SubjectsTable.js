// src/components/admin/SubjectsTable.js
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert, Skeleton, Button, Tooltip, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import apiClient from '../../api/axiosInstance';
import { useNotifications } from '../../contexts/NotificationsContext';
import EditableSubjectRow from './EditableSubjectRow';
import AddSubjectRow from './AddSubjectRow';

const newSubjectInitialState = {
    name: '',
    subjectKey: '',
    description: '',
    displayOrder: '',
    iconName: 'DefaultIcon',
    accentColorDark: '#FFFFFF',
    accentColorLight: '#000000',
};

// List of valid icon names that can be used.
const iconNames = ["BoltIcon", "ScienceIcon", "BiotechIcon", "CalculateIcon", "PublicIcon", "SchoolIcon", "DefaultIcon"];

function SubjectsTable() {
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { addNotification } = useNotifications();

    // UI State Management
    const [isEditMode, setIsEditMode] = useState(false); // Global toggle for enabling edit/delete actions
    const [editingRowId, setEditingRowId] = useState(null); // The ID of the single row currently being edited
    const [newSubjectData, setNewSubjectData] = useState(newSubjectInitialState);

    // Fetch initial data
    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/api/subjects');
            setSubjects(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch subjects data.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Client-Side Validation Logic ---
    const validateSubject = (data, subjectId = null) => {
        const { name, displayOrder, subjectKey, iconName } = data;
        if (!name.trim() || !subjectKey.trim() || !displayOrder) {
            addNotification('Name, Subject Key, and Display Order are required fields.', 'error');
            return false;
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subjectKey)) {
             addNotification('Subject Key must be all lowercase and can only contain letters, numbers, and hyphens.', 'error');
             return false;
        }
        if (!iconNames.includes(iconName)) {
            addNotification(`Icon name "${iconName}" is not valid. Available icons are: ${iconNames.join(', ')}`, 'warning');
            return false;
        }
        
        const existingSubjects = subjects.filter(s => s.id !== subjectId);
        
        if (existingSubjects.some(s => s.displayOrder === parseInt(displayOrder))) {
            addNotification('Display Order must be unique.', 'error');
            return false;
        }
        if (existingSubjects.some(s => s.subjectKey.toLowerCase() === subjectKey.toLowerCase())) {
            addNotification('Subject Key must be unique.', 'error');
            return false;
        }
        return true;
    };

    // --- CRUD Event Handlers ---
    const handleSave = async (subjectId, updatedData) => {
        if (!validateSubject(updatedData, subjectId)) return;

        try {
            const response = await apiClient.put(`/api/admin/subjects/${subjectId}`, updatedData);
            const updatedSubjects = subjects.map(s => s.id === subjectId ? response.data : s);
            setSubjects(updatedSubjects);
            setEditingRowId(null); // Exit edit mode for this row
            addNotification('Subject updated successfully!', 'success');
        } catch (err) {
            addNotification(err.response?.data?.message || 'Failed to update subject.', 'error');
        }
    };
    
    const handleDelete = async (subjectId) => {
        if (window.confirm('Are you sure you want to delete this subject? This action cannot be undone and will fail if topics are linked to it.')) {
            try {
                await apiClient.delete(`/api/admin/subjects/${subjectId}`);
                setSubjects(subjects.filter(s => s.id !== subjectId));
                addNotification('Subject deleted successfully!', 'success');
            } catch (err) {
                addNotification(err.response?.data?.message || 'Failed to delete subject.', 'error');
            }
        }
    };
    
    const handleAdd = async () => {
        if (!validateSubject(newSubjectData, null)) return;

        try {
            const response = await apiClient.post('/api/admin/subjects', newSubjectData);
            setSubjects([...subjects, response.data]); // Add new subject to the list
            setNewSubjectData(newSubjectInitialState); // Reset the form
            addNotification('Subject added successfully!', 'success');
        } catch (err) {
            addNotification(err.response?.data?.message || 'Failed to add subject.', 'error');
        }
    };

    const handleNewSubjectFieldChange = (name, value) => {
        setNewSubjectData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Paper variant="outlined">
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Manage Subjects</Typography>
                <Tooltip title={isEditMode ? "Finish Editing" : "Enable Editing"}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setIsEditMode(!isEditMode);
                            setEditingRowId(null); // Always cancel any active edit when toggling global mode
                        }}
                        startIcon={isEditMode ? <CloseIcon /> : <EditIcon />}
                    >
                        {isEditMode ? "Done" : "Edit"}
                    </Button>
                </Tooltip>
            </Box>
            <Divider />
            {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                           <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                           <TableCell sx={{ fontWeight: 'bold' }}>Subject Key</TableCell>
                           <TableCell>Description</TableCell>
                           <TableCell align="center" sx={{ fontWeight: 'bold' }}>Order</TableCell>
                           <TableCell>Icon Name</TableCell>
                           <TableCell>Accent Colors</TableCell>
                           <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            Array.from(new Array(5)).map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={7}><Skeleton /></TableCell></TableRow>
                            ))
                        ) : (
                            subjects
                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                .map((subject) => (
                                <EditableSubjectRow
                                    key={subject.id}
                                    subject={subject}
                                    isGloballyEditing={isEditMode}
                                    isCurrentlyEditing={editingRowId === subject.id}
                                    onEdit={(id) => setEditingRowId(id)}
                                    onCancel={() => setEditingRowId(null)}
                                    onSave={handleSave}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                        {isEditMode && (
                            <AddSubjectRow
                                newSubject={newSubjectData}
                                onFieldChange={handleNewSubjectFieldChange}
                                onAdd={handleAdd}
                            />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

export default SubjectsTable;