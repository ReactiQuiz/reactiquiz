// src/components/quiz/QuestionsPdfModal.js
import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select,
  MenuItem, TextField, useTheme, Typography, FormGroup, FormControlLabel, Checkbox, Divider, Box, CircularProgress
} from '@mui/material';
import { darken } from '@mui/material/styles';
import { generateQuestionsPdf } from '../../utils/questionsPdfGenerator';

function QuestionsPdfModal({ open, onClose, topic, accentColor }) {
  const theme = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState({
    difficulty: 'medium',
    numQuestions: 20,
    fontSize: 12,
    includeAnswers: true,
    includeExplanations: false,
    answersAtEnd: true,
  });

  const [numError, setNumError] = useState('');
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumChange = (e) => {
    const value = e.target.value;
    if (value > 100 || value < 1) {
      setNumError("Enter a number between 1 and 100.");
    } else {
      setNumError("");
    }
    setSettings(prev => ({ ...prev, numQuestions: value }));
  };

  const handleGenerateClick = async () => {
    if (numError) return;
    setIsGenerating(true);
    await generateQuestionsPdf(topic, settings);
    setIsGenerating(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { minWidth: '320px', maxWidth: '500px' } }}>
      <DialogTitle sx={{ backgroundColor: effectiveAccentColor, color: theme.palette.getContrastText(effectiveAccentColor), pb: 1.5, pt: 2 }}>
        Print Questions for: {topic.name}
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="body2">Configure the question set for your PDF document.</Typography>
        <FormControl fullWidth>
          <InputLabel>Difficulty</InputLabel>
          <Select name="difficulty" value={settings.difficulty} label="Difficulty" onChange={handleChange}>
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
            <MenuItem value="mixed">Mixed</MenuItem>
          </Select>
        </FormControl>
        <TextField
          name="numQuestions" label="Number of Questions" type="number" value={settings.numQuestions}
          onChange={handleNumChange} error={!!numError} helperText={numError}
          inputProps={{ min: 1, max: 100, step: 1 }}
        />
        <TextField
          name="fontSize" label="Font Size" type="number" value={settings.fontSize}
          onChange={handleChange} inputProps={{ min: 8, max: 16, step: 1 }}
        />
        <Divider />
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={settings.includeAnswers} onChange={handleChange} name="includeAnswers" />} label="Include Answers" />
          {settings.includeAnswers && (
            <Box sx={{ pl: 3 }}>
              <FormControlLabel control={<Checkbox checked={settings.includeExplanations} onChange={handleChange} name="includeExplanations" />} label="Include Explanations" />
              <FormControlLabel control={<Checkbox checked={settings.answersAtEnd} onChange={handleChange} name="answersAtEnd" />} label="Print Answer Key at the End" />
            </Box>
          )}
        </FormGroup>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} sx={{ color: effectiveAccentColor }}>Cancel</Button>
        <Button
          onClick={handleGenerateClick}
          variant="contained"
          disabled={isGenerating || !!numError}
          sx={{ backgroundColor: effectiveAccentColor, '&:hover': { backgroundColor: darken(effectiveAccentColor, 0.2) } }}
        >
          {isGenerating ? <CircularProgress size={24} color="inherit" /> : 'Generate PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QuestionsPdfModal;