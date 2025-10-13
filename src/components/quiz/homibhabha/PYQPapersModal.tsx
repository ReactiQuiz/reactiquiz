// src/components/quiz/homibhabha/PYQPapersModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl,
  InputLabel, Select, MenuItem, Typography, Box, useTheme, Divider
} from '@mui/material';
import { darken } from '@mui/material/styles';

const AVAILABLE_CLASSES: string[] = ['6', '9']; 
const AVAILABLE_YEARS: string[] = ['2023', '2022', '2021', '2020'];

interface PYQPapersModalProps {
  open: boolean;
  onClose: () => void;
  onStartTest: (settings: { class: string; year: string }) => void;
  accentColor: string;
}

const PYQPapersModal: React.FC<PYQPapersModalProps> = ({ open, onClose, onStartTest, accentColor }) => {
  const theme = useTheme();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  useEffect(() => {
    if (open) {
      setSelectedClass('');
      setSelectedYear('');
    }
  }, [open]);

  const handleStartTest = (): void => {
    if (selectedClass && selectedYear) {
      onStartTest({ class: selectedClass, year: selectedYear });
    }
  };

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
