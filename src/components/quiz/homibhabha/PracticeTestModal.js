// src/components/PracticeTestModal.js
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl,
  InputLabel, Select, MenuItem, Typography, useTheme
} from '@mui/material';
import { darken } from '@mui/material/styles';

// Assuming Homi Bhabha is for Std 6 and Std 9
const AVAILABLE_CLASSES = ['6', '9'];

function PracticeTestModal({ open, onClose, onSubmit, accentColor }) {
  const theme = useTheme();
  const [selectedClass, setSelectedClass] = useState('');
  const [difficulty, setDifficulty] = useState('medium'); // Example additional setting

  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  useEffect(() => {
    if (open) {
      setSelectedClass('');
      setDifficulty('medium');
    }
  }, [open]);

  const handleSubmit = () => {
    if (selectedClass) {
      onSubmit({ class: selectedClass, difficulty });
      onClose();
    } else {
      alert("Please select a class.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { minWidth: '320px', maxWidth: '500px' } }}>
      <DialogTitle sx={{ backgroundColor: effectiveAccentColor, color: theme.palette.getContrastText(effectiveAccentColor), pb: 1.5, pt: 2 }}>
        Homi Bhabha Practice Test
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="body1" gutterBottom>
          Select your class and preferred difficulty to start a practice test.
        </Typography>
        <FormControl fullWidth required>
          <InputLabel id="practice-class-select-label">Select Class (Std.)</InputLabel>
          <Select
            labelId="practice-class-select-label"
            value={selectedClass}
            label="Select Class (Std.)"
            onChange={(e) => setSelectedClass(e.target.value)}
            MenuProps={{ PaperProps: { sx: { backgroundColor: theme.palette.background.paper } } }}
          >
            <MenuItem value=""><em>-- Select Class --</em></MenuItem>
            {AVAILABLE_CLASSES.map(cls => (
              <MenuItem key={cls} value={cls}>{cls}th</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="practice-difficulty-select-label">Difficulty</InputLabel>
          <Select
            labelId="practice-difficulty-select-label"
            value={difficulty}
            label="Difficulty"
            onChange={(e) => setDifficulty(e.target.value)}
            MenuProps={{ PaperProps: { sx: { backgroundColor: theme.palette.background.paper } } }}
          >
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
            <MenuItem value="mixed">Mixed (All Levels)</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} sx={{ color: effectiveAccentColor }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: effectiveAccentColor,
            color: theme.palette.getContrastText(effectiveAccentColor),
            '&:hover': { backgroundColor: darken(effectiveAccentColor, 0.2) }
          }}
          disabled={!selectedClass}
        >
          Start Practice Test
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PracticeTestModal;