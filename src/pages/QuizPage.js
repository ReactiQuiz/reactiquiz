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
  darken, useTheme
} from '@mui/material/styles';

// ----Import question files----
import allChemistryQuestions from '../questions/chemistry.json';
import allPhysicsQuestions from '../questions/physics.json';
import allMathematicsQuestions from '../questions/mathematics.json';
import allBiologyQuestions from '../questions/biology.json';

import {
  subjectAccentColors as themeSubjectAccentColors
} from '../theme';
import QuestionItem from '../components/QuestionItem';

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

  const currentAccentColor = subjectAccentColors[subject?.toLowerCase()] || quizSettings.accentColor || subjectAccentColors.default;

  useEffect(() => {
    setIsLoading(true);
    setError('');

    if (!subject || !topicId) {
      setError("Subject or Topic ID is missing.");
      setIsLoading(false);
      setQuestions([]);
      return;
    }

    let allQuestionsForSubject;
    const subjectLower = subject.toLowerCase();

    if (subjectLower === 'chemistry' && process.env.REACT_APP_CHEMISTRY_QUESTIONS_MODULE_PATH) {
      allQuestionsForSubject = subjectQuestionMap.chemistry;
    } else if (subjectLower === 'physics' && process.env.REACT_APP_PHYSICS_QUESTIONS_MODULE_PATH) {
      allQuestionsForSubject = subjectQuestionMap.physics;
    } else if (subjectLower === 'mathematics' && process.env.REACT_APP_MATHEMATICS_QUESTIONS_MODULE_PATH) {
      allQuestionsForSubject = subjectQuestionMap.mathematics;
    } else if (subjectLower === 'biology' && process.env.REACT_APP_BIOLOGY_QUESTIONS_MODULE_PATH) {
      allQuestionsForSubject = subjectQuestionMap.biology;
    } else {
      allQuestionsForSubject = subjectQuestionMap[subjectLower];
    }

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
    }
    setUserAnswers({});
    setIsLoading(false);
  }, [subject, topicId, difficultyLabel, numQuestionsReq, topicNameFromState]);

  const handleOptionSelectForQuestion = (questionId, selectedOptionId) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: selectedOptionId,
    }));
  };

  const handleSubmitQuiz = useCallback(() => {
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
        quizClass: quizClassFromState,
      }
    });
  }, [userAnswers, questions, navigate, currentAccentColor, subject, topicId, difficultyLabel, numQuestionsReq, quizClassFromState]);

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
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto' }}>
      <Typography variant="h4" gutterBottom component="div" sx={{ mb: 1, textAlign: 'center', color: currentAccentColor, fontWeight: 'bold' }}>
        {subject && topicId
          ? `${subject.charAt(0).toUpperCase() + subject.slice(1)} Quiz`
          : 'Quiz'}
      </Typography>
      <Typography variant="h6" component="div" sx={{ mb: 3, textAlign: 'center', color: theme.palette.text.secondary, fontWeight: 'normal', textTransform: 'capitalize' }}>
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