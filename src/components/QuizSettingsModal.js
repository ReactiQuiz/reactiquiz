// src/components/QuizSettingsModal.js
import {
  useState, useEffect
} from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, TextField, useTheme, Typography
} from '@mui/material';
import {
  darken
} from '@mui/material/styles';


function QuizSettingsModal({ 
    open, 
    onClose, 
    onSubmit, 
    topicName, 
    accentColor,
    isChallengeMode = false // New prop
}) {
  const theme = useTheme();
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [numQuestionsError, setNumQuestionsError] = useState('');

  const effectiveAccentColor = accentColor || theme.palette.primary.main;


  useEffect(() => {
    if (open) { // Only reset if the modal is actually being opened (not for nested always-open case)
      setDifficulty('medium');
      setNumQuestions(isChallengeMode ? 20 : 10); // Default 20 for challenge, 10 otherwise
      setNumQuestionsError('');
    }
  }, [open, isChallengeMode]);

  const handleNumQuestionsChange = (event) => {
    const value = event.target.value;
    const maxQs = isChallengeMode ? 50 : 50; // Max questions for challenge or regular quiz
    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= maxQs)) {
      setNumQuestions(value === '' ? '' : Number(value));
      setNumQuestionsError('');
    } else {
      setNumQuestions(value);
      if (value !== '' && (Number(value) < 1 || Number(value) > maxQs || !/^\d+$/.test(value))) {
        setNumQuestionsError(`Please enter a number between 1 and ${maxQs}.`);
      } else {
        setNumQuestionsError('');
      }
    }
  };

  const handleSubmit = () => {
    const maxQs = isChallengeMode ? 50 : 50;
    const finalNumQuestions = numQuestions === '' ? (isChallengeMode ? 20 : 10) : Number(numQuestions);
    if (finalNumQuestions < 1 || finalNumQuestions > maxQs || isNaN(finalNumQuestions)) {
      setNumQuestionsError(`Please enter a valid number between 1 and ${maxQs}.`);
      return;
    }
    onSubmit({ difficulty, numQuestions: finalNumQuestions });
    // onClose(); // Don't call onClose if it's nested and always "open"
  };

  // If this modal is used *inside* another dialog (like the challenge creation dialog),
  // we might not want it to render its own Dialog container.
  // However, for simplicity in this step, it still renders a Dialog.
  // A more advanced solution might have this component return only its content,
  // and the parent dialog handles the Dialog structure.

  return (
    // If it's challenge mode and meant to be *part* of another dialog,
    // you might conditionally render <Dialog> or just the <DialogContent> and <DialogActions>
    // For now, keeping it simple.
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { minWidth: '300px', maxWidth: '500px' } }}>
      <DialogTitle sx={{ backgroundColor: effectiveAccentColor, color: theme.palette.getContrastText(effectiveAccentColor), pb: 1.5, pt: 2 }}>
        {isChallengeMode ? `Set Challenge Rules for ${topicName}` : `Quiz Settings: ${topicName}`}
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {isChallengeMode && <Typography variant="body2">Opponent will play with same settings.</Typography>}
        <FormControl fullWidth>
          <InputLabel id="difficulty-select-label">Difficulty</InputLabel>
          <Select
            labelId="difficulty-select-label"
            id="difficulty-select"
            value={difficulty}
            label="Difficulty"
            onChange={(e) => setDifficulty(e.target.value)}
            MenuProps={{ PaperProps: { sx: { backgroundColor: theme.palette.background.paper } } }}
          >
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
            <MenuItem value="mixed">Mixed</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label={`Number of Questions (1-${isChallengeMode ? 50 : 50})`}
          type="number"
          value={numQuestions}
          onChange={handleNumQuestionsChange}
          inputProps={{ min: 1, max: (isChallengeMode ? 50 : 50), step: 1 }}
          error={!!numQuestionsError}
          helperText={numQuestionsError}
        />
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
          disabled={!!numQuestionsError || numQuestions === ''}
        >
          {isChallengeMode ? "Send Challenge" : "Start Quiz"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QuizSettingsModal;