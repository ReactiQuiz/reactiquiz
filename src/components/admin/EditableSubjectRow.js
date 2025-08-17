// src/components/admin/EditableSubjectRow.js
import React, { useState, useEffect } from 'react';
import { TableRow, TableCell, TextField, Chip, Box, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // Import Edit icon

const EditableSubjectRow = ({
    subject,
    isGloballyEditing,
    isCurrentlyEditing,
    onEdit,
    onCancel,
    onSave,
    onDelete,
}) => {
    // --- START OF THE DEFINITIVE FIX: Local state for editing ---
    // Each row now manages its own form data.
    const [editData, setEditData] = useState(subject);

    // If the parent cancels the edit (e.g. by clicking "Done"), reset local state.
    useEffect(() => {
        setEditData(subject);
    }, [isCurrentlyEditing, subject]);
    // --- END OF THE DEFINITIVE FIX ---

    const handleInputChange = (e) => {
        setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            {isCurrentlyEditing ? (
                // --- EDIT MODE ---
                <>
                    <TableCell><TextField size="small" name="name" value={editData.name} onChange={handleInputChange} fullWidth /></TableCell>
                    <TableCell><TextField size="small" name="subjectKey" value={editData.subjectKey} onChange={handleInputChange} fullWidth /></TableCell>
                    <TableCell><TextField size="small" name="description" value={editData.description} onChange={handleInputChange} fullWidth multiline maxRows={2} /></TableCell>
                    <TableCell><TextField size="small" name="displayOrder" type="number" value={editData.displayOrder} onChange={handleInputChange} sx={{width: 80}} /></TableCell>
                    <TableCell><TextField size="small" name="iconName" value={editData.iconName} onChange={handleInputChange} fullWidth /></TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField size="small" label="Dark" type="color" name="accentColorDark" value={editData.accentColorDark} onChange={handleInputChange} sx={{width: 100}} />
                            <TextField size="small" label="Light" type="color" name="accentColorLight" value={editData.accentColorLight} onChange={handleInputChange} sx={{width: 100}}/>
                        </Box>
                    </TableCell>
                    <TableCell align="right">
                        <Tooltip title="Save Changes"><IconButton onClick={() => onSave(subject.id, editData)} color="primary"><SaveIcon /></IconButton></Tooltip>
                        <Tooltip title="Cancel Edit"><IconButton onClick={onCancel}><CancelIcon /></IconButton></Tooltip>
                    </TableCell>
                </>
            ) : (
                // --- VIEW MODE ---
                <>
                    <TableCell sx={{ fontWeight: 500 }}>{subject.name}</TableCell>
                    <TableCell><Chip label={subject.subjectKey} size="small" /></TableCell>
                    <TableCell>{subject.description}</TableCell>
                    <TableCell align="center">{subject.displayOrder}</TableCell>
                    <TableCell>{subject.iconName}</TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box title={subject.accentColorDark} sx={{ width: 20, height: 20, bgcolor: subject.accentColorDark, borderRadius: '4px', border: '1px solid #fff' }} />
                            <Box title={subject.accentColorLight} sx={{ width: 20, height: 20, bgcolor: subject.accentColorLight, borderRadius: '4px', border: '1px solid #333' }} />
                        </Box>
                    </TableCell>
                    <TableCell align="right">
                        {/* Show edit/delete buttons only when global edit mode is on */}
                        {isGloballyEditing && (
                            <>
                                <Tooltip title="Edit Row"><IconButton onClick={() => onEdit(subject.id)}><EditIcon /></IconButton></Tooltip>
                                <Tooltip title="Delete Subject"><IconButton onClick={() => onDelete(subject.id)} color="error"><DeleteIcon /></IconButton></Tooltip>
                            </>
                        )}
                    </TableCell>
                </>
            )}
        </TableRow>
    );
};

export default EditableSubjectRow;