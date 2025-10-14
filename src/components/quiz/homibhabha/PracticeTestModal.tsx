// src/components/quiz/homibhabha/PracticeTestModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl,
  InputLabel, Select, MenuItem, Typography, useTheme, Box, Divider
} from '@mui/material';
import { darken } from '@mui/material/styles';

const AVAILABLE_CLASSES: string[] = ['6', '9'];

interface PracticeTestModalProps {
  open: boolean;
  onClose: () => void;
  onStartTest: (settings: { class: string; difficulty: string }) => void;
  accentColor: string;
}

const PracticeTestModal: React.FC<PracticeTestModalProps> = ({ open, onClose, onStartTest, accentColor }) => {
  const theme = useTheme();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('medium');

  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  useEffect(() => {
    if (open) {
      setSelectedClass('');
      setDifficulty('medium');
    }
  }, [open]);

  const handleSubmit = (): void => {
    if (selectedClass) {
      onStartTest({ class: selectedClass, difficulty });
    }
  };

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
