// src/components/admin/AddSubjectRow.js
import React from 'react';
import { TableRow, TableCell, TextField, Button, Box } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const AddSubjectRow = ({ newSubject, onFieldChange, onAdd }) => {
    const handleInputChange = (e) => {
        onFieldChange(e.target.name, e.target.value);
    };

    return (
        <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
            <TableCell><TextField label="Name*" size="small" name="name" value={newSubject.name} onChange={handleInputChange} fullWidth /></TableCell>
            <TableCell><TextField label="Subject Key*" size="small" name="subjectKey" value={newSubject.subjectKey} onChange={handleInputChange} fullWidth /></TableCell>
            <TableCell><TextField label="Description" size="small" name="description" value={newSubject.description} onChange={handleInputChange} fullWidth /></TableCell>
            <TableCell><TextField label="Order*" size="small" name="displayOrder" type="number" value={newSubject.displayOrder} onChange={handleInputChange} sx={{width: 80}} /></TableCell>
            <TableCell><TextField label="Icon Name" size="small" name="iconName" value={newSubject.iconName} onChange={handleInputChange} fullWidth /></TableCell>
            <TableCell>
                 <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField label="Dark Color" size="small" name="accentColorDark" type="color" value={newSubject.accentColorDark} onChange={handleInputChange} sx={{width: 100}} />
                    <TextField label="Light Color" size="small" name="accentColorLight" type="color" value={newSubject.accentColorLight} onChange={handleInputChange} sx={{width: 100}}/>
                </Box>
            </TableCell>
            <TableCell align="right">
                <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={onAdd}>
                    Add
                </Button>
            </TableCell>
        </TableRow>
    );
};

export default AddSubjectRow;