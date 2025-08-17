// src/components/admin/SubjectsTable.js
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert, Skeleton, Button, Tooltip, IconButton
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
    iconName: '',
    accentColorDark: '#FFFFFF',
    accentColorLight: '#000000',
};

const iconNames = ["BoltIcon", "ScienceIcon", "BiotechIcon", "CalculateIcon", "PublicIcon", "SchoolIcon", "DefaultIcon"];

function SubjectsTable() {
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { addNotification } = useNotifications();

    // UI State
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [newSubjectData, setNewSubjectData] = useState(newSubjectInitialState);

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

    useEffect(() => {
        fetchSubjects();
    }, []);

    // --- Validation Logic ---
    const validateSubject = (data, isNew = false) => {
        const { name, displayOrder, subjectKey, iconName } = data;
        if (!name.trim() || !subjectKey.trim() || !displayOrder) {
            addNotification('Name, Subject Key, and Display Order are required.', 'error');
            return false;
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subjectKey)) {
             addNotification('Subject Key must be lowercase alphanumeric with hyphens.', 'error');
             return false;
        }
        if (!iconNames.includes(iconName)) {
            addNotification(`Icon name "${iconName}" is not valid.`, 'warning');
            return false;
        }
        const existingSubjects = isNew ? subjects : subjects.filter(s => s.id !== editingRowId);
        if (existingSubjects.some(s => s.displayOrder === parseInt(displayOrder))) {
            addNotification('Display Order must be unique.', 'error');
            return false;
        }
        if (existingSubjects.some(s => s.subjectKey === subjectKey)) {
            addNotification('Subject Key must be unique.', 'error');
            return false;
        }
        return true;
    };

    // --- Event Handlers ---
    const handleEditClick = (subject) => {
        setIsEditMode(true);
        setEditingRowId(subject.id);
        setEditFormData(subject);
    };

    const handleCancel = () => {
        setEditingRowId(null);
        // If no rows are being edited, exit table-wide edit mode
        if (subjects.every(s => s.id !== editingRowId)) {
            setIsEditMode(false);
        }
    };

    const handleSave = async (subjectId) => {
        if (!validateSubject(editFormData)) return;
        try {
            const response = await apiClient.put(`/api/admin/subjects/${subjectId}`, editFormData);
            const updatedSubjects = subjects.map(s => s.id === subjectId ? response.data : s);
            setSubjects(updatedSubjects);
            setEditingRowId(null);
            addNotification('Subject updated successfully!', 'success');
        } catch (err) {
            addNotification(err.response?.data?.message || 'Failed to update subject.', 'error');
        }
    };

    const handleDelete = async (subjectId) => {
        if (window.confirm('Are you sure you want to delete this subject? This cannot be undone.')) {
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
        if (!validateSubject(newSubjectData, true)) return;
        try {
            const response = await apiClient.post('/api/admin/subjects', newSubjectData);
            setSubjects([...subjects, response.data]);
            setNewSubjectData(newSubjectInitialState);
            addNotification('Subject added successfully!', 'success');
        } catch (err) {
            addNotification(err.response?.data?.message || 'Failed to add subject.', 'error');
        }
    };

    const handleFieldChange = (name, value) => {
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNewSubjectFieldChange = (name, value) => {
        setNewSubjectData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Paper variant="outlined">
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Manage Subjects</Typography>
                <Tooltip title={isEditMode ? "Finish Editing" : "Edit Subjects"}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setIsEditMode(!isEditMode);
                            setEditingRowId(null); // Clear any specific editing row
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
                           {/* Table Headers */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            Array.from(new Array(5)).map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={isEditMode ? 8 : 7}><Skeleton /></TableCell></TableRow>
                            ))
                        ) : (
                            subjects.map((subject) => (
                                <EditableSubjectRow
                                    key={subject.id}
                                    subject={subject}
                                    editData={editFormData}
                                    isEditing={isEditMode && editingRowId === subject.id}
                                    onEdit={() => handleEditClick(subject)}
                                    onCancel={handleCancel}
                                    onSave={handleSave}
                                    onDelete={handleDelete}
                                    onFieldChange={handleFieldChange}
                                />
                            ))
                        )}
                        {/* Only show the 'Add' form when in edit mode */}
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