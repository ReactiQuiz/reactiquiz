// src/pages/QuizPage.js
import {
  useState, useEffect, useCallback
} from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert
} from '@mui/material';
import {
  useParams, useNavigate, useLocation
} from 'react-router-dom';
import {
  darken, useTheme, alpha
} from '@mui/material/styles';
import axios from 'axios';

import {
  subjectAccentColors as themeSubjectAccentColors
} from '../theme';
import QuestionItem from '../components/QuestionItem';
import { formatTime } from '../utils/formatTime';

const subjectAccentColors = themeSubjectAccentColors;

const shuffleArray = (array) => {
  if (!array || !Array.isArray(array)) return [];
  let newArray = [...array];
  let currentIndex = newArray.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

function QuizPage() {
  const { topicId } = useParams(); // Removed subject from params
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const quizSettings = location.state || {};
  const subject = quizSettings.subject; // Get subject from location state
  const difficultyLabel = (quizSettings.difficulty || 'medium').toLowerCase();
  const numQuestionsReq = quizSettings.numQuestions || 10;
  const topicNameFromState = quizSettings.topicName || topicId.replace(/-/g, ' ');
  const quizClassFromState = quizSettings.quizClass;

  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission

  const currentAccentColor = subjectAccentColors[subject?.toLowerCase()] || quizSettings.accentColor || subjectAccentColors.default;

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      setError('');
      setTimerActive(false);
      setElapsedTime(0);
      setUserAnswers({});
      setQuestions([]);
      setIsSubmitting(false); // Reset submission state on new quiz load


      if (!topicId || !subject) { // Check for subject from state as well
        setError("Topic ID or Subject context is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/questions/${topicId}`);
        let fetchedQuestions = response.data;

        if (!Array.isArray(fetchedQuestions)) {
            console.error("Fetched questions is not an array:", fetchedQuestions);
            setError(`Invalid question data received for ${topicNameFromState}.`);
            setIsLoading(false);
            return;
        }
        
        console.log(`Fetched ${fetchedQuestions.length} questions for ${topicId}`);


        let filteredByDifficultyQuestions;
        if (difficultyLabel === 'mixed') {
          filteredByDifficultyQuestions = [...fetchedQuestions];
        } else {
          let minScore = 0;
          let maxScore = Infinity;

          if (difficultyLabel === 'easy') {
            minScore = 10; 
            maxScore = 13;
          } else if (difficultyLabel === 'medium') {
            minScore = 14; 
            maxScore = 17;
          } else if (difficultyLabel === 'hard') {
            minScore = 18; 
            maxScore = 20;
          }
          
          filteredByDifficultyQuestions = fetchedQuestions.filter(q =>
            q.hasOwnProperty('difficulty') &&
            typeof q.difficulty === 'number' &&
            q.difficulty >= minScore &&
            q.difficulty <= maxScore
          );
        }

        if (filteredByDifficultyQuestions.length === 0) {
          setError(`No questions found for topic "${topicNameFromState}" with difficulty "${difficultyLabel}". Try 'Mixed' or another topic.`);
        } else {
          const shuffledQuestions = shuffleArray(filteredByDifficultyQuestions);
          const selectedQuestions = shuffledQuestions.slice(0, numQuestionsReq);
          setQuestions(selectedQuestions);
          if (selectedQuestions.length > 0) {
            setTimerActive(true);
          }
        }
      } catch (err) {
        console.error("Error fetching questions:", err.response || err.message);
        setError(`Failed to load questions for ${topicNameFromState}. ${err.response?.data?.message || err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [subject, topicId, difficultyLabel, numQuestionsReq, topicNameFromState]); // subject from state now

  useEffect(() => {
    let intervalId;
    if (timerActive) {
      intervalId = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [timerActive]);


  const handleOptionSelectForQuestion = (questionId, selectedOptionId) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: selectedOptionId,
    }));
  };

  const handleSubmitQuiz = useCallback(() => {
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true); // Set submitting state
    setTimerActive(false); // Stop the timer on submit

    const questionsActuallyAttemptedIds = questions.map(q => q.id);
    
    const relevantUserAnswersSnapshot = {};
    questionsActuallyAttemptedIds.forEach(id => {
      if (userAnswers.hasOwnProperty(id)) {
        relevantUserAnswersSnapshot[id] = userAnswers[id];
      } else {
        relevantUserAnswersSnapshot[id] = null; 
      }
    });

    // Generate a unique ID for this quiz attempt on the client-side
    // This can help ResultsPage identify if it has already processed this specific attempt
    const quizAttemptId = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;


    navigate('/results', {
      state: {
        quizAttemptId: quizAttemptId, // Send unique attempt ID
        userAnswersSnapshot: relevantUserAnswersSnapshot,
        questionsActuallyAttemptedIds: questionsActuallyAttemptedIds,
        originalQuestionsForDisplay: questions, 
        originalAnswersForDisplay: userAnswers,
        subjectAccentColor: currentAccentColor,
        subject: subject,
        topicId: topicId,
        difficulty: difficultyLabel,
        numQuestionsConfigured: numQuestionsReq,
        timeTaken: elapsedTime,
        quizClass: quizClassFromState,
      }
    });
  }, [
      userAnswers, 
      questions, 
      navigate, 
      currentAccentColor, 
      subject, 
      topicId, 
      difficultyLabel, 
      numQuestionsReq, 
      elapsedTime, 
      quizClassFromState,
      isSubmitting // Add isSubmitting to dependencies
    ]);

  const allQuestionsAnswered = () => {
    if (questions.length === 0) return false;
    return questions.every(q => userAnswers.hasOwnProperty(q.id) && userAnswers[q.id] !== '' && userAnswers[q.id] !== undefined);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: currentAccentColor }} />
        <Typography sx={{ml:2}}>Loading Questions...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate(`/${subject}`)} sx={{ mt: 2, borderColor: currentAccentColor, color: currentAccentColor }}>
          Back to {subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Topics'}
        </Button>
      </Box>
    );
  }

  if (!isLoading && questions.length === 0 && !error) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>No Questions Available</Typography>
        <Typography>
          No questions are currently available for the selected topic and difficulty.
          Please try different settings or another topic.
        </Typography>
        <Button variant="outlined" onClick={() => navigate(`/${subject}`)} sx={{ mt: 3, borderColor: currentAccentColor, color: currentAccentColor }}>
          Back to {subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Topics'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto' }}>
      {timerActive && questions.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: { xs: `calc(56px + ${theme.spacing(1)})`, sm: `calc(64px + ${theme.spacing(1)})` },
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            color: 'white',
            padding: theme.spacing(0.75, 2),
            borderRadius: theme.shape.borderRadius,
            zIndex: 1050,
            boxShadow: theme.shadows[3],
            minWidth: '80px',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
            {formatTime(elapsedTime)}
          </Typography>
        </Box>
      )}

      <Typography
        variant="h4"
        gutterBottom
        component="div"
        sx={{
          mb: 1,
          textAlign: 'center',
          color: currentAccentColor,
          fontWeight: 'bold',
          mt: theme.spacing(4.5) 
        }}
      >
        {subject
          ? `${subject.charAt(0).toUpperCase() + subject.slice(1)} Quiz`
          : 'Quiz'}
      </Typography>
      <Typography
        variant="h6"
        component="div"
        sx={{
          mb: 3, 
          textAlign: 'center',
          color: theme.palette.text.secondary,
          fontWeight: 'normal',
          textTransform: 'capitalize'
        }}
      >
        Topic: {topicNameFromState}
        {quizClassFromState && ` (Class ${quizClassFromState})`}
        {' '}({difficultyLabel}, {questions.length} Questions)
      </Typography>
      

      {questions.map((question, index) => (
        <QuestionItem
          key={question.id}
          question={question}
          questionNumber={index + 1}
          selectedOptionId={userAnswers[question.id]}
          onOptionSelect={handleOptionSelectForQuestion}
          accentColor={currentAccentColor}
        />
      ))}

      <Box display="flex" justifyContent="center" sx={{ mt: 3, mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmitQuiz}
          disabled={!allQuestionsAnswered() || isSubmitting} // Disable if not all answered or already submitting
          sx={{
            backgroundColor: currentAccentColor,
            color: theme.palette.getContrastText(currentAccentColor),
            '&:hover': {
              backgroundColor: darken(currentAccentColor, 0.15),
            },
            minWidth: '200px',
          }}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Submit Quiz"}
        </Button>
      </Box>
    </Box>
  );
}

export default QuizPage;