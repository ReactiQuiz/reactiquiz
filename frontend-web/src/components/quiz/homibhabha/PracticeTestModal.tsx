// src/components/quiz/homibhabha/PracticeTestModal.tsx
/**
 * Practice Test Modal Component
 * 
 * This component displays a modal dialog for configuring Homi Bhabha
 * practice test settings. It includes class selection and difficulty
 * selection with form validation.
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl,
  InputLabel, Select, MenuItem, Typography, useTheme, Box, Divider
} from '@mui/material';
import { darken } from '@mui/material/styles';

/**
 * Available Classes
 * 
 * Available class options for Homi Bhabha practice tests.
 * Currently supports classes 6 and 9.
 */
const AVAILABLE_CLASSES: string[] = ['6', '9'];

/**
 * PracticeTestModalProps Interface
 * 
 * Props for the PracticeTestModal component.
 */
interface PracticeTestModalProps {
  open: boolean; // Whether the modal is open
  onClose: () => void; // Callback to close the modal
  onStartTest: (settings: { class: string; difficulty: string }) => void; // Callback to start test with settings
  accentColor: string; // Accent color for styling
}

/**
 * Practice Test Modal Component
 * 
 * Displays a modal dialog for configuring Homi Bhabha practice test.
 * Features:
 * - Class selection dropdown (6th or 9th class)
 * - Difficulty selection dropdown (easy, medium, hard)
 * - Form validation
 * - Settings reset when modal opens
 * 
 * This component is used on the HomibhabhaPage to configure
 * practice test settings before starting.
 * 
 * @param {PracticeTestModalProps} props - Component props
 * @returns {JSX.Element} Practice test settings modal dialog
 */
const PracticeTestModal: React.FC<PracticeTestModalProps> = ({ open, onClose, onStartTest, accentColor }) => {
  // Get theme for styling
  const theme = useTheme();
  // State for form inputs
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('medium');

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
      // Reset form inputs to defaults
      setSelectedClass('');
      setDifficulty('medium');
    }
  }, [open]);

  /**
   * Handle Submit
   * 
   * Handles form submission for starting practice test.
   * Validates that class is selected before proceeding.
   */
  const handleSubmit = (): void => {
    // Validate class selection
    if (selectedClass) {
      // Call onStartTest callback with selected settings
      onStartTest({ class: selectedClass, difficulty });
    }
  };

  // Validate form - class is required
  const isFormValid = selectedClass;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          Practice Test
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Configure your practice test settings
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
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficulty}
              label="Difficulty"
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
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
          onClick={handleSubmit}
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

export default PracticeTestModal;
