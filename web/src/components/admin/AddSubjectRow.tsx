// src/components/admin/AddSubjectRow.tsx
/**
 * Add Subject Row Component
 * 
 * This component displays a table row for adding a new subject
 * in the admin subjects table. It includes form fields for all
 * subject properties and an Add button.
 */
import React from 'react';
import { TableRow, TableCell, TextField, Button, Box } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

/**
 * Add Subject Row Component
 * 
 * Displays a table row with form fields for adding a new subject:
 * - Name field (required)
 * - Subject Key field (required)
 * - Description field
 * - Display Order field (number, required)
 * - Icon Name field
 * - Accent Colors (Dark and Light color pickers)
 * - Add button
 * 
 * This component is used in SubjectsTable to provide a row
 * for adding new subjects when edit mode is enabled.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.newSubject - New subject data object
 * @param {Function} props.onFieldChange - Callback for field changes
 * @param {Function} props.onAdd - Callback for add button click
 * @returns {JSX.Element} Table row with subject form fields
 */
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