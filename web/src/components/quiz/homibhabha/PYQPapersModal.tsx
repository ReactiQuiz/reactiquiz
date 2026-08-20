// src/components/quiz/homibhabha/PYQPapersModal.tsx
/**
 * PYQ Papers Modal Component
 * 
 * This component displays a modal dialog for selecting Homi Bhabha
 * Previous Year Questions (PYQ) papers. It includes class and year
 * selection with form validation.
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl,
  InputLabel, Select, MenuItem, Typography, Box, useTheme, Divider
} from '@mui/material';
import { darken } from '@mui/material/styles';

/**
 * Available Classes
 * 
 * Available class options for Homi Bhabha PYQ tests.
 * Currently supports classes 6 and 9.
 */
const AVAILABLE_CLASSES: string[] = ['6', '9']; 

/**
 * Available Years
 * 
 * Available year options for previous year question papers.
 * Currently includes years 2020-2023.
 */
const AVAILABLE_YEARS: string[] = ['2023', '2022', '2021', '2020'];

/**
 * PYQPapersModalProps Interface
 * 
 * Props for the PYQPapersModal component.
 */
interface PYQPapersModalProps {
  open: boolean; // Whether the modal is open
  onClose: () => void; // Callback to close the modal
  onStartTest: (settings: { class: string; year: string }) => void; // Callback to start test with settings
  accentColor: string; // Accent color for styling
}

/**
 * PYQ Papers Modal Component
 * 
 * Displays a modal dialog for selecting Previous Year Questions papers.
 * Features:
 * - Class selection dropdown (6th or 9th class)
 * - Year selection dropdown (2020-2023)
 * - Form validation (both class and year required)
 * - Settings reset when modal opens
 * 
 * This component is used on the HomibhabhaPage to configure
 * PYQ test settings before starting.
 * 
 * @param {PYQPapersModalProps} props - Component props
 * @returns {JSX.Element} PYQ papers selection modal dialog
 */
const PYQPapersModal: React.FC<PYQPapersModalProps> = ({ open, onClose, onStartTest, accentColor }) => {
  // Get theme for styling
  const theme = useTheme();
  // State for form inputs
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Use accent color or default to primary theme color
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  /**
   * Reset Settings Effect
   * 
   * Resets all settings to defaults when modal opens.
   * This ensures users always see default values when opening the modal.
   */
  useEffect(() => {
    if (open) {
      // Reset form inputs to empty
      setSelectedClass('');
      setSelectedYear('');
    }
  }, [open]);

  /**
   * Handle Start Test
   * 
   * Handles form submission for starting PYQ test.
   * Validates that both class and year are selected before proceeding.
   */
  const handleStartTest = (): void => {
    // Validate both class and year are selected
    if (selectedClass && selectedYear) {
      // Call onStartTest callback with selected settings
      onStartTest({ class: selectedClass, year: selectedYear });
    }
  };

  // Validate form - both class and year are required
  const isFormValid = selectedClass && selectedYear;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          Previous Year Papers
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Select class and year to access previous year question papers
        </Typography>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Class</InputLabel>
            <Select
              value={selectedClass}
              label="Class"
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {AVAILABLE_CLASSES.map((cls) => (
                <MenuItem key={cls} value={cls}>
                  {cls}th Class
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {AVAILABLE_YEARS.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ minWidth: 100 }}>
          Cancel
        </Button>
        <Button
          onClick={handleStartTest}
          variant="contained"
          disabled={!isFormValid}
          sx={{
            backgroundColor: effectiveAccentColor,
            color: theme.palette.getContrastText(effectiveAccentColor),
            '&:hover': {
              backgroundColor: darken(effectiveAccentColor, 0.1),
            },
            minWidth: 120,
          }}
        >
          Start Test
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PYQPapersModal;
