// src/components/quiz/QuestionsPdfModal.tsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select,
  MenuItem, TextField, useTheme, Typography, FormGroup, FormControlLabel, Checkbox, Divider, Box, CircularProgress, SelectChangeEvent
} from '@mui/material';
import { darken } from '@mui/material/styles';
import { generateQuestionsPdf } from '../../utils/questionsPdfGenerator';
import { Topic } from '../../types';

interface QuestionsPdfModalProps {
  open: boolean;
  onClose: () => void;
  topic: Topic | null;
  accentColor: string;
}

interface PdfSettings {
  difficulty: string;
  numQuestions: number;
  fontSize: string;
  includeAnswers: boolean;
  includeExplanations: boolean;
  answersAtEnd: boolean;
}

const QuestionsPdfModal: React.FC<QuestionsPdfModalProps> = ({ open, onClose, topic, accentColor }) => {
  const theme = useTheme();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [settings, setSettings] = useState<PdfSettings>({
    difficulty: 'medium',
    numQuestions: 20,
    fontSize: '12',
    includeAnswers: true,
    includeExplanations: false,
    answersAtEnd: true,
  });

  const [numError, setNumError] = useState<string>('');
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = event.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'numQuestions') {
      const num = Number(value);
      if (value === '' || (num >= 1 && num <= 100)) {
        setNumError('');
      } else {
        setNumError('Number of questions must be between 1 and 100');
      }
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>): void => {
    const { name, value } = event.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async (): Promise<void> => {
    if (!topic) return;
    
    setIsGenerating(true);
    try {
      await generateQuestionsPdf(topic, {
        ...settings,
        fontSize: parseInt(settings.fontSize)
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = settings.numQuestions >= 1 && settings.numQuestions <= 100 && !numError;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: effectiveAccentColor }}>
          Generate PDF
        </Typography>
        {topic && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {topic.name}
          </Typography>
        )}
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select
              name="difficulty"
              value={settings.difficulty}
              label="Difficulty"
              onChange={handleSelectChange}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            <MenuItem value="maxed">Maxed</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            name="numQuestions"
            label="Number of Questions"
            type="number"
            value={settings.numQuestions}
            onChange={handleInputChange}
            error={!!numError}
            helperText={numError || 'Enter number of questions (1-100)'}
            inputProps={{ min: 1, max: 100 }}
          />

          <FormControl fullWidth>
            <InputLabel>Font Size</InputLabel>
            <Select
              name="fontSize"
              value={settings.fontSize}
              label="Font Size"
              onChange={handleSelectChange}
            >
              <MenuItem value={10}>10pt</MenuItem>
              <MenuItem value={12}>12pt</MenuItem>
              <MenuItem value={14}>14pt</MenuItem>
              <MenuItem value={16}>16pt</MenuItem>
            </Select>
          </FormControl>

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  name="includeAnswers"
                  checked={settings.includeAnswers}
                  onChange={handleInputChange}
                />
              }
              label="Include Answers"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="includeExplanations"
                  checked={settings.includeExplanations}
                  onChange={handleInputChange}
                />
              }
              label="Include Explanations"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="answersAtEnd"
                  checked={settings.answersAtEnd}
                  onChange={handleInputChange}
                />
              }
              label="Answers at End"
            />
          </FormGroup>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ minWidth: 100 }}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={!isFormValid || isGenerating}
          sx={{
            backgroundColor: effectiveAccentColor,
            color: theme.palette.getContrastText(effectiveAccentColor),
            '&:hover': {
              backgroundColor: darken(effectiveAccentColor, 0.1),
            },
            minWidth: 120,
          }}
        >
          {isGenerating ? <CircularProgress size={20} color="inherit" /> : 'Generate PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionsPdfModal;
