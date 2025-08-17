// src/components/admin/EditableSubjectRow.js
import React from 'react';
import { TableRow, TableCell, TextField, Chip, Box, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

const EditableSubjectRow = ({
    subject,
    editData,
    isEditing,
    onEdit,
    onCancel,
    onSave,
    onDelete,
    onFieldChange
}) => {
    const handleInputChange = (e) => {
        onFieldChange(e.target.name, e.target.value);
    };

    const handleColorChange = (name, color) => {
        onFieldChange(name, color);
    };

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            {isEditing ? (
                <>
                    <TableCell><TextField size="small" name="name" value={editData.name} onChange={handleInputChange} fullWidth /></TableCell>
                    <TableCell><TextField size="small" name="subjectKey" value={editData.subjectKey} onChange={handleInputChange} fullWidth /></TableCell>
                    <TableCell><TextField size="small" name="description" value={editData.description} onChange={handleInputChange} fullWidth multiline maxRows={2} /></TableCell>
                    <TableCell><TextField size="small" name="displayOrder" type="number" value={editData.displayOrder} onChange={handleInputChange} fullWidth /></TableCell>
                    <TableCell><TextField size="small" name="iconName" value={editData.iconName} onChange={handleInputChange} fullWidth /></TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField size="small" name="accentColorDark" label="Dark" type="color" value={editData.accentColorDark} onChange={handleInputChange} sx={{width: 100}} />
                            <TextField size="small" name="accentColorLight" label="Light" type="color" value={editData.accentColorLight} onChange={handleInputChange} sx={{width: 100}}/>
                        </Box>
                    </TableCell>
                    <TableCell align="right">
                        <Tooltip title="Save Changes"><IconButton onClick={() => onSave(subject.id)} color="success"><SaveIcon /></IconButton></Tooltip>
                        <Tooltip title="Cancel"><IconButton onClick={onCancel}><CancelIcon /></IconButton></Tooltip>
                    </TableCell>
                </>
            ) : (
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
                        <Tooltip title="Delete Subject"><IconButton onClick={() => onDelete(subject.id)} color="error"><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                </>
            )}
        </TableRow>
    );
};

export default EditableSubjectRow;