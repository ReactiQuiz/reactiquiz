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

/* ----Import question files---- */
import allChemistryQuestions from '../questions/chemistry.json';
import allPhysicsQuestions from '../questions/physics.json';
import allMathematicsQuestions from '../questions/mathematics.json';
import allBiologyQuestions from '../questions/biology.json';

import {
  subjectAccentColors as themeSubjectAccentColors
} from '../theme';
import QuestionItem from '../components/QuestionItem';
import { formatTime } from '../utils/formatTime'; // Import the new utility

const subjectQuestionMap = {
  chemistry: allChemistryQuestions,
  physics: allPhysicsQuestions,
  mathematics: allMathematicsQuestions,
  biology: allBiologyQuestions,
};

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
  const { subject, topicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const quizSettings = location.state || {};
  const difficultyLabel = (quizSettings.difficulty || 'medium').toLowerCase();
  const numQuestionsReq = quizSettings.numQuestions || 10;
  const topicNameFromState = quizSettings.topicName || topicId.replace(/-/g, ' ');
  const quizClassFromState = quizSettings.quizClass;

  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0); // State for timer
  const [timerActive, setTimerActive] = useState(false); // Control timer activity


  const currentAccentColor = subjectAccentColors[subject?.toLowerCase()] || quizSettings.accentColor || subjectAccentColors.default;

  useEffect(() => {
    setIsLoading(true);
    setError('');
    setTimerActive(false); // Stop timer during loading/re-fetching
    setElapsedTime(0); // Reset timer

    if (!subject || !topicId) {
      setError("Subject or Topic ID is missing.");
      setIsLoading(false);
      setQuestions([]);
      return;
    }

    let allQuestionsForSubject;
    const subjectLower = subject.toLowerCase();

    // Simplified question loading logic
    allQuestionsForSubject = subjectQuestionMap[subjectLower];


    if (!allQuestionsForSubject) {
      setError(`Questions for subject "${subject}" not found or path not configured.`);
      setQuestions([]);
      setIsLoading(false);
      return;
    }

    const topicQuestions = allQuestionsForSubject.filter(q => q.topicId === topicId);

    let filteredByDifficultyQuestions;
    if (difficultyLabel === 'mixed') {
      filteredByDifficultyQuestions = [...topicQuestions];
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
      filteredByDifficultyQuestions = topicQuestions.filter(q =>
        q.hasOwnProperty('difficulty') &&
        typeof q.difficulty === 'number' &&
        q.difficulty >= minScore &&
        q.difficulty <= maxScore
      );
    }

    if (filteredByDifficultyQuestions.length === 0) {
      setError(`No questions found for topic "${topicNameFromState}" with difficulty "${difficultyLabel}". Please try 'Mixed' difficulty or another topic.`);
      setQuestions([]);
    } else {
      const shuffledQuestions = shuffleArray(filteredByDifficultyQuestions);
      const selectedQuestions = shuffledQuestions.slice(0, numQuestionsReq);
      setQuestions(selectedQuestions);
      if (selectedQuestions.length > 0) {
        setTimerActive(true); // Start timer only if questions are loaded
      }
    }
    setUserAnswers({});
    setIsLoading(false);
  }, [subject, topicId, difficultyLabel, numQuestionsReq, topicNameFromState]);

  // Timer effect
  useEffect(() => {
    let intervalId;
    if (timerActive) {
      intervalId = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId); // Cleanup on unmount or if timerActive becomes false
  }, [timerActive]);


  const handleOptionSelectForQuestion = (questionId, selectedOptionId) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: selectedOptionId,
    }));
  };

  const handleSubmitQuiz = useCallback(() => {
    setTimerActive(false); // Stop the timer on submit
    navigate('/results', {
      state: {
        answers: userAnswers,
        questions: questions,
        subjectAccentColor: currentAccentColor,
        subject: subject,
        topicId: topicId,
        difficulty: difficultyLabel,
        numQuestions: questions.length,
        numQuestionsConfigured: numQuestionsReq,
        timeTaken: elapsedTime, // Pass elapsed time
        quizClass: quizClassFromState,
      }
    });
  }, [userAnswers, questions, navigate, currentAccentColor, subject, topicId, difficultyLabel, numQuestionsReq, elapsedTime, quizClassFromState]);

  const allQuestionsAnswered = () => {
    if (questions.length === 0) return false;
    return questions.every(q => userAnswers.hasOwnProperty(q.id) && userAnswers[q.id] !== '' && userAnswers[q.id] !== undefined);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: currentAccentColor }} />
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
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto' }}> {/* This Box is inside the Container with mt: '64px' and py: 3 */}
      {/* Fixed Timer Display */}
      {timerActive && questions.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: {
              xs: `calc(56px + ${theme.spacing(1)})`, // Mobile AppBar (56px) + 8px margin
              sm: `calc(64px + ${theme.spacing(1)})`  // Desktop AppBar (64px) + 8px margin
            },
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            color: 'white', // Explicitly white text
            padding: theme.spacing(0.75, 2),
            borderRadius: theme.shape.borderRadius,
            zIndex: 1050, // Above scrollable content, below drawer/modals
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
          mt: theme.spacing(4.5) // Pushes title down to avoid overlap with fixed timer
        }}
      >
        {subject && topicId
          ? `${subject.charAt(0).toUpperCase() + subject.slice(1)} Quiz`
          : 'Quiz'}
      </Typography>
      <Typography
        variant="h6"
        component="div"
        sx={{
          mb: 3, // Increased margin bottom from timer
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