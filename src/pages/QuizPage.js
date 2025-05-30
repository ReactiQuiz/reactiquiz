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
import apiClient from '../api/axiosInstance'; 

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

const fetchAndFilterSubjectQuestions = async (subjectName, targetClass, difficultyLabel, numQuestionsNeeded) => {
  console.log(`[QuizPage] Fetching for subject: ${subjectName}, class: ${targetClass}, difficulty: ${difficultyLabel}, needed: ${numQuestionsNeeded}`);
  try {
    const topicsResponse = await apiClient.get(`/api/topics/${subjectName.toLowerCase()}`);
    if (!Array.isArray(topicsResponse.data) || topicsResponse.data.length === 0) {
      console.warn(`[QuizPage] No topics found for subject ${subjectName}.`);
      return [];
    }
    const subjectTopicIds = topicsResponse.data.map(topic => topic.id);
    if (subjectTopicIds.length === 0) {
        console.warn(`[QuizPage] No topic IDs extracted for subject ${subjectName}.`);
        return [];
    }
    // console.log(`[QuizPage] Found topic IDs for ${subjectName}:`, subjectTopicIds); // Can be verbose

    let allQuestionsForSubject = [];
    for (const topicId of subjectTopicIds) {
      try {
        const questionsResponse = await apiClient.get(`/api/questions/${topicId}`);
        if (Array.isArray(questionsResponse.data)) {
          const topicInfo = topicsResponse.data.find(t => t.id === topicId);
          const questionsWithContext = questionsResponse.data.map(q => ({
            ...q,
            subject: subjectName.toLowerCase(),
            class: q.class || topicInfo?.class || null 
          }));
          allQuestionsForSubject = allQuestionsForSubject.concat(questionsWithContext);
        }
      } catch (err) {
        console.warn(`[QuizPage] Error fetching questions for topicId ${topicId}: ${err.message}`);
      }
    }
    
    // console.log(`[QuizPage] Total questions fetched for ${subjectName} before filtering: ${allQuestionsForSubject.length}`);
    if (allQuestionsForSubject.length === 0) return [];

    let classFilteredQuestions = allQuestionsForSubject;
    if (targetClass) {
      classFilteredQuestions = allQuestionsForSubject.filter(q => 
        !q.class || q.class === targetClass 
      );
    }
    // console.log(`[QuizPage] Questions for ${subjectName} after class filter ('${targetClass || 'any'}'): ${classFilteredQuestions.length}`);
    if (classFilteredQuestions.length === 0 && targetClass) { 
        console.warn(`[QuizPage] No questions for ${subjectName} matched class ${targetClass}. Trying without class filter for this subject.`);
        classFilteredQuestions = allQuestionsForSubject; 
    }
    if (classFilteredQuestions.length === 0) return [];

    let difficultyFilteredQuestions;
    if (difficultyLabel === 'mixed') {
      difficultyFilteredQuestions = [...classFilteredQuestions];
    } else {
      let minScore = 0;
      let maxScore = Infinity;
      if (difficultyLabel === 'easy') { minScore = 10; maxScore = 13; }
      else if (difficultyLabel === 'medium') { minScore = 14; maxScore = 17; }
      else if (difficultyLabel === 'hard') { minScore = 18; maxScore = 20; }
      
      difficultyFilteredQuestions = classFilteredQuestions.filter(q =>
        q.hasOwnProperty('difficulty') &&
        typeof q.difficulty === 'number' &&
        q.difficulty >= minScore &&
        q.difficulty <= maxScore
      );
    }
    // console.log(`[QuizPage] Questions for ${subjectName} after difficulty filter ('${difficultyLabel}'): ${difficultyFilteredQuestions.length}`);
    
    if (difficultyFilteredQuestions.length === 0 && difficultyLabel !== 'mixed' && classFilteredQuestions.length > 0) {
        console.warn(`[QuizPage] No questions for ${subjectName} (class: ${targetClass || 'any'}) matched difficulty ${difficultyLabel}. Using questions from any difficulty for this subject.`);
        difficultyFilteredQuestions = [...classFilteredQuestions];
    }
    if (difficultyFilteredQuestions.length === 0) return [];

    const shuffled = shuffleArray(difficultyFilteredQuestions); // Shuffle within the subject's filtered pool
    const selected = shuffled.slice(0, numQuestionsNeeded); 
    console.log(`[QuizPage] Selected ${selected.length} questions for ${subjectName}.`);
    return selected;

  } catch (error) {
    console.error(`[QuizPage] Overall error fetching questions for subject ${subjectName}:`, error);
    return [];
  }
};


function QuizPage() {
  const { topicId } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const quizSettings = location.state || {};
  const quizType = quizSettings.quizType; 
  const subject = quizSettings.subject;   
  const difficultyLabel = (quizSettings.difficulty || 'medium').toLowerCase();
  const numQuestionsReq = quizSettings.numQuestions || (quizType === 'homibhabha-practice' ? quizSettings.totalQuestions : 10);
  const topicNameFromState = quizSettings.topicName || topicId.replace(/-/g, ' ');
  const quizClassFromState = quizSettings.quizClass; 
  const timeLimit = quizSettings.timeLimit; 
  const questionComposition = quizSettings.questionComposition; 

  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState(''); 
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentAccentColor = subjectAccentColors[subject?.toLowerCase()] || quizSettings.accentColor || subjectAccentColors.default;

  useEffect(() => {
    const fetchQuizData = async () => {
      setIsLoading(true);
      setError('');
      setInfoMessage('');
      setTimerActive(false);
      setElapsedTime(0);
      setUserAnswers({});
      setQuestions([]);
      setIsSubmitting(false);

      if (quizType === 'homibhabha-practice' && questionComposition) {
        let finalQuizQuestions = [];
        let totalFetchedCount = 0;
        const desiredTotal = quizSettings.totalQuestions || 100;

        // Define the order of subjects
        const subjectOrder = ['physics', 'chemistry', 'biology', 'gk']; 

        for (const subjKey of subjectOrder) {
          if (questionComposition[subjKey]) {
            const countNeeded = questionComposition[subjKey];
            const subjectQuestions = await fetchAndFilterSubjectQuestions(subjKey, quizClassFromState, difficultyLabel, countNeeded);
            finalQuizQuestions.push(...subjectQuestions); // Add fetched questions for this subject
            totalFetchedCount += subjectQuestions.length;
            if (subjectQuestions.length < countNeeded) {
              setInfoMessage(prev => prev + `Could not find all ${countNeeded} ${difficultyLabel} questions for ${subjKey} (Class ${quizClassFromState || 'Any'}); got ${subjectQuestions.length}. `);
            }
          }
        }
        
        // Ensure uniqueness across the entire set if questions might overlap due to general topic fetching
        const uniqueQuestionsMap = new Map();
        finalQuizQuestions.forEach(q => {
          if (!uniqueQuestionsMap.has(q.id)) {
            uniqueQuestionsMap.set(q.id, q);
          }
        });
        const uniqueFinalQuizQuestions = Array.from(uniqueQuestionsMap.values());
        
        if (uniqueFinalQuizQuestions.length === 0) {
             setError(`Could not gather any questions for the practice test. Please try different settings or check question availability.`);
             setIsLoading(false);
             return;
        }
        if (uniqueFinalQuizQuestions.length < desiredTotal && totalFetchedCount < desiredTotal) { // Check totalFetchedCount to reflect if we even tried for 100
            setInfoMessage(prev => prev + `Total questions for test is ${uniqueFinalQuizQuestions.length} instead of desired ${desiredTotal}. `);
        }

        setQuestions(uniqueFinalQuizQuestions); // Set questions in the fetched subject order
        if (uniqueFinalQuizQuestions.length > 0) setTimerActive(true);

      } else if (topicId && subject) { 
        try {
          const response = await apiClient.get(`/api/questions/${topicId}`);
          let fetchedQuestions = response.data;

          if (!Array.isArray(fetchedQuestions)) {
            console.error("Fetched questions is not an array:", fetchedQuestions);
            setError(`Invalid question data received for ${topicNameFromState}.`);
            setIsLoading(false);
            return;
          }
          
          let classFilteredQuestions = fetchedQuestions;
          if (quizClassFromState && subject !== 'gk' && subject !== 'mathematics') { 
            classFilteredQuestions = fetchedQuestions.filter(q => 
                !q.class || q.class === quizClassFromState
            );
          }

          let filteredByDifficultyQuestions;
          if (difficultyLabel === 'mixed') {
            filteredByDifficultyQuestions = [...classFilteredQuestions];
          } else {
            let minScore = 0;
            let maxScore = Infinity;
            if (difficultyLabel === 'easy') { minScore = 10; maxScore = 13; }
            else if (difficultyLabel === 'medium') { minScore = 14; maxScore = 17; }
            else if (difficultyLabel === 'hard') { minScore = 18; maxScore = 20; }
            
            filteredByDifficultyQuestions = classFilteredQuestions.filter(q =>
              q.hasOwnProperty('difficulty') &&
              typeof q.difficulty === 'number' &&
              q.difficulty >= minScore &&
              q.difficulty <= maxScore
            );
          }

          if (filteredByDifficultyQuestions.length === 0) {
            setError(`No questions found for topic "${topicNameFromState}" (Class: ${quizClassFromState || 'Any'}, Difficulty: "${difficultyLabel}"). Try 'Mixed' or another topic.`);
          } else {
            const shuffledQuestions = shuffleArray(filteredByDifficultyQuestions);
            const selectedQuestions = shuffledQuestions.slice(0, numQuestionsReq);
            setQuestions(selectedQuestions);
            if (selectedQuestions.length > 0) setTimerActive(true);
          }
        } catch (err) {
          console.error("Error fetching questions:", err.response || err.message);
          setError(`Failed to load questions for ${topicNameFromState}. ${err.response?.data?.message || err.message}`);
        }
      } else {
        setError("Quiz configuration is missing (topicId, subject, or practice test settings).");
      }
      setIsLoading(false);
    };

    fetchQuizData();
  }, [quizType, subject, topicId, difficultyLabel, numQuestionsReq, topicNameFromState, questionComposition, quizClassFromState, quizSettings.totalQuestions]);

  const submitAndNavigate = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimerActive(false);

    const questionsActuallyAttemptedIds = questions.map(q => q.id);
    const relevantUserAnswersSnapshot = {};
    questionsActuallyAttemptedIds.forEach(id => {
      relevantUserAnswersSnapshot[id] = userAnswers[id] || null; 
    });

    const quizAttemptId = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    navigate('/results', {
      state: {
        quizAttemptId: quizAttemptId,
        userAnswersSnapshot: relevantUserAnswersSnapshot,
        questionsActuallyAttemptedIds: questionsActuallyAttemptedIds,
        originalQuestionsForDisplay: questions, 
        originalAnswersForDisplay: userAnswers, 
        subjectAccentColor: currentAccentColor,
        subject: subject,
        topicId: quizType === 'homibhabha-practice' ? `homibhabha-practice-${quizClassFromState}-${difficultyLabel}` : topicId,
        difficulty: difficultyLabel,
        numQuestionsConfigured: questions.length, // Use the actual number of questions presented
        timeTaken: elapsedTime,
        quizClass: quizClassFromState,
        isPracticeTest: quizType === 'homibhabha-practice', 
      }
    });
  }, [userAnswers, questions, navigate, currentAccentColor, subject, topicId, difficultyLabel, /* numQuestionsReq removed */ elapsedTime, quizClassFromState, isSubmitting, quizType]);

  useEffect(() => {
    let intervalId;
    if (timerActive) {
      intervalId = setInterval(() => {
        setElapsedTime(prevTime => {
          const newTime = prevTime + 1;
          if (timeLimit && newTime >= timeLimit) {
            clearInterval(intervalId);
            setTimerActive(false);
            console.log("Time limit reached, auto-submitting quiz.");
            submitAndNavigate(); 
            return timeLimit;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [timerActive, timeLimit, submitAndNavigate]);

  const handleOptionSelectForQuestion = (questionId, selectedOptionId) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: selectedOptionId,
    }));
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
        <Button variant="outlined" onClick={() => navigate(subject === 'homibhabha' ? '/homibhabha' : `/${subject}`)} sx={{ mt: 2, borderColor: currentAccentColor, color: currentAccentColor }}>
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
          No questions are currently available for the selected settings.
          Please try different settings or another topic.
        </Typography>
        <Button variant="outlined" onClick={() => navigate(subject === 'homibhabha' ? '/homibhabha' : `/${subject}`)} sx={{ mt: 3, borderColor: currentAccentColor, color: currentAccentColor }}>
          Back to {subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Topics'}
        </Button>
      </Box>
    );
  }

  const remainingTime = timeLimit ? Math.max(0, timeLimit - elapsedTime) : elapsedTime;
  const displayTime = timeLimit ? remainingTime : elapsedTime;
  
  const baseTimerColorForAlpha = timeLimit && remainingTime < 600 
    ? theme.palette.error.main 
    : theme.palette.text.primary;

  const timerDisplayTextColor = timeLimit && remainingTime < 600 
    ? theme.palette.error.main 
    : theme.palette.text.primary;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto' }}>
      {(timerActive || elapsedTime > 0) && questions.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: { xs: `calc(56px + ${theme.spacing(1)})`, sm: `calc(64px + ${theme.spacing(1)})` },
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            color: timerDisplayTextColor,
            padding: theme.spacing(0.75, 2),
            borderRadius: theme.shape.borderRadius,
            zIndex: 1050,
            boxShadow: theme.shadows[3],
            minWidth: '100px',
            textAlign: 'center',
            border: `1px solid ${alpha(baseTimerColorForAlpha, 0.5)}`
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
            {timeLimit ? 'Time Left: ' : 'Time: '} {formatTime(displayTime)}
          </Typography>
        </Box>
      )}
      
      {infoMessage && (
        <Alert severity="info" sx={{ my: 2, mt: (timerActive || elapsedTime > 0) && questions.length > 0 ? theme.spacing(8) : 2 }}>
          {infoMessage}
        </Alert>
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
          mt: !infoMessage && ((timerActive || elapsedTime > 0) && questions.length > 0) ? theme.spacing(8) : ((timerActive || elapsedTime > 0) && questions.length > 0 ? theme.spacing(1) : theme.spacing(4.5)) // Adjust margin if timer is present
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
          key={question.id || `q-${index}-${Math.random()}`} 
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
          onClick={submitAndNavigate}
          disabled={isSubmitting || questions.length === 0} 
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