import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, RadioGroup, FormControlLabel, Radio, Paper, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

// --- Import Question Data ---
import allChemistryQuestions from '../../questions/chemistry.json';
import allPhysicsQuestions from '../../questions/physics.json';
import allMathematicsQuestions from '../../questions/mathematics.json';
import allBiologyQuestions from '../../questions/biology.json';

const subjectQuestionMap = {
  chemistry: allChemistryQuestions,
  physics: allPhysicsQuestions,
  mathematics: allMathematicsQuestions,
  biology: allBiologyQuestions,
};

// Helper function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = (array) => {
  let currentIndex = array.length,  randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};


function QuizPage() {
  const { subject, topicId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError('');
    // console.log("QuizPage useEffect: Loading for subject =", subject, "topicId =", topicId);

    const allQuestionsForSubject = subjectQuestionMap[subject.toLowerCase()];

    if (!allQuestionsForSubject) {
      setError(`Questions for subject "${subject}" not found.`);
      setQuestions([]);
      setIsLoading(false);
      return;
    }

    const topicQuestions = allQuestionsForSubject.filter(q => q.topicId === topicId);
    // console.log("Filtered topicQuestions for", topicId + ":", topicQuestions.length, topicQuestions);

    if (topicQuestions.length === 0) {
      setError(`No questions found for topic "${topicId}" in subject "${subject}".`);
      setQuestions([]);
    } else {
      // --- SHUFFLE AND SLICE ---
      const shuffledQuestions = shuffleArray([...topicQuestions]); // Shuffle a copy of the array
      const selectedQuestions = shuffledQuestions.slice(0, 10); // Take the first 10 (or fewer if less than 10)
      setQuestions(selectedQuestions);
      // console.log("Setting questions state with", selectedQuestions.length, "questions after shuffle and slice.");
    }
    setCurrentQuestionIndex(0);
    setSelectedOption('');
    setUserAnswers({});
    setIsLoading(false);
  }, [subject, topicId]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleNextQuestion = useCallback(() => {
    if (currentQuestion && selectedOption) {
      setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedOption }));
    }
    setSelectedOption('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      const finalAnswers = { ...userAnswers, ...(currentQuestion && selectedOption && { [currentQuestion.id]: selectedOption }) };
      navigate('/results', { state: { answers: finalAnswers, questions: questions } });
    }
  }, [currentQuestionIndex, questions, selectedOption, currentQuestion, userAnswers, navigate]);


  // ... (rest of the component: isLoading, error, rendering JSX remains the same)
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Box>
    );
  }

  if (!currentQuestion) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No questions available for this topic, or quiz already completed.</Typography>
         <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '700px', margin: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom component="div">
          Question {currentQuestionIndex + 1} of {questions.length}
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {currentQuestion.text}
        </Typography>
        <RadioGroup
          aria-label="quiz-option"
          name="quiz-option-group"
          value={selectedOption}
          onChange={handleOptionChange}
        >
          {currentQuestion.options.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio />}
              label={option.text}
              sx={{ mb: 1 }}
            />
          ))}
        </RadioGroup>
      </Paper>

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          onClick={handleNextQuestion}
          disabled={!selectedOption}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </Box>
    </Box>
  );
}

export default QuizPage;