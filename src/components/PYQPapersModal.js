// src/components/PYQPapersModal.js
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl,
  InputLabel, Select, MenuItem, Typography, Box, useTheme, Divider
} from '@mui/material';
import { darken } from '@mui/material/styles';

const AVAILABLE_CLASSES = ['6', '9']; 
const AVAILABLE_YEARS = ['2023', '2022', '2021', '2020'];

function PYQPapersModal({ open, onClose, onSubmit, accentColor }) {
  const theme = useTheme();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  useEffect(() => {
    if (open) {
      setSelectedClass('');
      setSelectedYear('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (selectedClass && selectedYear) {
      onSubmit({ class: selectedClass, year: selectedYear });
      onClose();
    } else {
      alert("Please select both class and year.");
    }
  };

  const examDetails = {
    duration: "90 minutes",
    totalQuestions: 100,
    marksPerQuestion: 1,
    negativeMarking: "No negative marking.",
    totalMarks: 100,
    subjects: "Physics(30), Chemistry(30), Biology(30), and General Knowledge(10)"
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { minWidth: '320px', maxWidth: '550px' } }}>
      <DialogTitle sx={{ backgroundColor: effectiveAccentColor, color: theme.palette.getContrastText(effectiveAccentColor), pb: 1.5, pt: 2 }}>
        Previous Year Question Paper
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="h6" gutterBottom>Exam Details:</Typography>
        <Box sx={{ textAlign: 'left', pl: 1 }}>
          <Typography variant="body2"><strong>Duration:</strong> {examDetails.duration}</Typography>
          <Typography variant="body2"><strong>Total Questions:</strong> {examDetails.totalQuestions}</Typography>
          <Typography variant="body2"><strong>Marks per Question:</strong> {examDetails.marksPerQuestion}</Typography>
          <Typography variant="body2"><strong>Total Marks:</strong> {examDetails.totalMarks}</Typography>
          <Typography variant="body2"><strong>Negative Marking:</strong> {examDetails.negativeMarking}</Typography>
          <Typography variant="body2"><strong>Syllabus Focus:</strong> {examDetails.subjects}</Typography>
          <Typography variant="body2" sx={{mt: 1}}><em>(Note: Specific details might vary per year/level, always refer to official notifications.)</em></Typography>
        </Box>
        <Divider sx={{ my: 2 }}/>
        <FormControl fullWidth required>
          <InputLabel id="pyq-class-select-label">Select Class (Std.)</InputLabel>
          <Select
            labelId="pyq-class-select-label"
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
        <FormControl fullWidth required disabled={!selectedClass}>
          <InputLabel id="pyq-year-select-label">Select Year</InputLabel>
          <Select
            labelId="pyq-year-select-label"
            value={selectedYear}
            label="Select Year"
            onChange={(e) => setSelectedYear(e.target.value)}
            MenuProps={{ PaperProps: { sx: { backgroundColor: theme.palette.background.paper } } }}
          >
            <MenuItem value=""><em>-- Select Year --</em></MenuItem>
            {AVAILABLE_YEARS.map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
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
          disabled={!selectedClass || !selectedYear}
        >
          Start PYQ Test
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PYQPapersModal;