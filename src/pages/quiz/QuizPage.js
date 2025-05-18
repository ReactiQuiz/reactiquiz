// src/pages/quiz/QuizPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { lighten, darken, useTheme } from '@mui/material/styles';

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

const subjectAccentColors = {
  chemistry: '#e53935', // Red 600
  physics: '#1e88e5',   // Blue 600
  mathematics: '#fb8c00', // Orange 600
  biology: '#43a047',   // Green 600
  default: '#757575'     // Grey 600
};

const shuffleArray = (array) => {
  if (!array || !Array.isArray(array)) return [];
  let newArray = [...array];
  let currentIndex = newArray.length,  randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

const QuestionItem = ({ question, questionNumber, onOptionSelect, selectedOptionId, accentColor }) => {
  const theme = useTheme();
  // console.log(`RENDERING QuestionItem ${question.id}. Received selectedOptionId: ${selectedOptionId}`);

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3, width: '100%' }}>
      <Typography variant="h6" gutterBottom component="div" sx={{ color: accentColor, fontWeight: 500 }}>
        Question {questionNumber}:
      </Typography>
      <Typography variant="body1" sx={{ mb: 2.5, color: theme.palette.text.primary }}>
        {question.text}
      </Typography>
      <Box display="flex" flexDirection="column" gap={1.5}>
        {question.options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          // console.log(`  Q_ID ${question.id}, Option_ID ${option.id}: isSelected = ${isSelected} (selectedOptionId was ${selectedOptionId})`);
          return (
            <Button
              key={option.id}
              variant={isSelected ? "contained" : "outlined"}
              fullWidth
              onClick={() => onOptionSelect(question.id, option.id)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1.5,
                borderColor: accentColor,
                color: isSelected
                  ? theme.palette.getContrastText(accentColor)
                  : 'white',
                backgroundColor: isSelected
                  ? accentColor
                  : 'transparent',
                '&:hover': {
                  borderColor: accentColor,
                  backgroundColor: isSelected
                    ? darken(accentColor, 0.1)
                    : lighten(accentColor, 0.9),
                  color: isSelected
                    ? theme.palette.getContrastText(darken(accentColor, 0.1))
                    : 'white',
                },
                textTransform: 'none',
                fontSize: '1rem',
                lineHeight: 1.5,
                fontWeight: isSelected ? 500 : 400,
              }}
            >
              {option.text}
            </Button>
          );
        })}
      </Box>
    </Paper>
  );
};


function QuizPage() {
  const { subject, topicId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const currentAccentColor = subjectAccentColors[subject?.toLowerCase()] || subjectAccentColors.default;

  useEffect(() => {
    setIsLoading(true);
    setError('');
    console.log("EFFECT: Loading questions for subject =", subject, "topicId =", topicId);

    if (!subject || !topicId) {
        console.log("EFFECT: Subject or TopicId is missing, skipping load.");
        setError("Subject or Topic ID is missing in the URL.");
        setIsLoading(false);
        setQuestions([]);
        return;
    }

    const allQuestionsForSubject = subjectQuestionMap[subject.toLowerCase()];
    // console.log('EFFECT - All questions for subject:', allQuestionsForSubject ? allQuestionsForSubject.length : 'undefined');


    if (!allQuestionsForSubject) {
      setError(`Questions for subject "${subject}" not found.`);
      setQuestions([]);
      setIsLoading(false);
      return;
    }

    const topicQuestions = allQuestionsForSubject.filter(q => q.topicId === topicId);
    // console.log('EFFECT - Filtered topicQuestions for', topicId + ":", topicQuestions.length);


    if (topicQuestions.length === 0) {
      setError(`No questions found for topic "${topicId}" in subject "${subject}".`);
      setQuestions([]);
    } else {
      const shuffledQuestions = shuffleArray([...topicQuestions]);
      // console.log('EFFECT - Shuffled questions:', shuffledQuestions.length);
      if (!shuffledQuestions) {
          console.error("Error: shuffledQuestions is undefined after shuffle!");
          setError("An error occurred while preparing questions.");
          setQuestions([]);
          setIsLoading(false);
          return;
      }
      const selectedQuestions = shuffledQuestions.slice(0, 10);
      setQuestions(selectedQuestions);
      // console.log("EFFECT - Setting questions state with", selectedQuestions.length, "questions.");
    }
    setUserAnswers({});
    setIsLoading(false);
  }, [subject, topicId]);

  const handleOptionSelectForQuestion = (questionId, selectedOptionId) => {
    console.log(`HANDLER: Option selected for Q_ID ${questionId}: Option_ID ${selectedOptionId}`);
    setUserAnswers(prevAnswers => {
      const newAnswers = {
        ...prevAnswers,
        [questionId]: selectedOptionId,
      };
      console.log('HANDLER - Updated userAnswers state:', newAnswers);
      return newAnswers;
    });
  };

  const handleSubmitQuiz = useCallback(() => {
    console.log("HANDLER: Quiz Submitted! Answers:", userAnswers);
    navigate('/results', { state: { answers: userAnswers, questions: questions, subjectAccentColor: currentAccentColor } });
  }, [userAnswers, questions, navigate, currentAccentColor]); // Added navigate and currentAccentColor as per eslint or usage

  const allQuestionsAnswered = () => {
    if (questions.length === 0) return false;
    return questions.every(q => userAnswers.hasOwnProperty(q.id) && userAnswers[q.id] !== '' && userAnswers[q.id] !== undefined);
  };


  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Box>
    );
  }

  // Add a check here before trying to render questions
  if (!isLoading && questions.length === 0 && !error) {
     return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto' }}>
        <Typography>No questions are currently available for this topic. Please try another.</Typography>
         <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Box>
    );
  }


  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto' }}>
      <Typography variant="h4" gutterBottom component="div" sx={{ mb: 3, textAlign: 'center', color: currentAccentColor, fontWeight: 'bold' }}>
        {/* Safety check for subject and topicId before using string methods */}
        {subject && topicId
          ? `${subject.charAt(0).toUpperCase() + subject.slice(1)} Quiz - ${topicId.replace(/-/g, ' ')}`
          : 'Quiz'}
      </Typography>

      {questions.map((question, index) => (
        <QuestionItem
          key={question.id}
          question={question}
          questionNumber={index + 1}
          selectedOptionId={userAnswers[question.id]} // Pass the selected option for this question
          onOptionSelect={handleOptionSelectForQuestion}
          accentColor={currentAccentColor}
        />
      ))}

      <Box display="flex" justifyContent="center" sx={{ mt: 3, mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmitQuiz}
          disabled={!allQuestionsAnswered()}
          sx={{
            backgroundColor: currentAccentColor,
            color: theme.palette.getContrastText(currentAccentColor),
            '&:hover': {
              backgroundColor: darken(currentAccentColor, 0.15),
            },
            minWidth: '200px',
          }}
        >
          Submit Quiz
        </Button>
      </Box>
    </Box>
  );
}

export default QuizPage;