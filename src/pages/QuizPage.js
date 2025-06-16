// --- START OF FILE src/pages/QuizPage.js ---

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

// Moved fetchAndFilterSubjectQuestions from inside QuizPage to be a top-level function
// as it was used by fetchHomiBhabhaPracticeQuestions which might also be better outside or passed in.
// For now, keeping it here but outside the component for clarity.
const fetchAndFilterSubjectQuestionsForPractice = async (subjectName, targetClass, difficultyLabel, numQuestionsNeeded) => {
  console.log(`[PracticeQuiz] Fetching for subject: ${subjectName}, class: ${targetClass}, difficulty: ${difficultyLabel}, needed: ${numQuestionsNeeded}`);
  try {
    const topicsResponse = await apiClient.get(`/api/topics/${subjectName.toLowerCase()}`);
    if (!Array.isArray(topicsResponse.data) || topicsResponse.data.length === 0) {
      console.warn(`[PracticeQuiz] No topics found for subject ${subjectName}.`);
      return [];
    }
    const subjectTopicIds = topicsResponse.data.map(topic => topic.id);
    if (subjectTopicIds.length === 0) {
      console.warn(`[PracticeQuiz] No topic IDs extracted for subject ${subjectName}.`);
      return [];
    }

    let allQuestionsForSubject = [];
    for (const topicId of subjectTopicIds) {
      try {
        // <<< CHANGE HERE: Using query parameter >>>
        const questionsResponse = await apiClient.get(`/api/questions?topicId=${topicId}`);
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
        console.warn(`[PracticeQuiz] Error fetching questions for topicId ${topicId}: ${err.message}`);
      }
    }

    if (allQuestionsForSubject.length === 0) return [];

    let classFilteredQuestions = allQuestionsForSubject;
    if (targetClass) {
      classFilteredQuestions = allQuestionsForSubject.filter(q =>
        !q.class || q.class === targetClass
      );
    }
    if (classFilteredQuestions.length === 0 && targetClass) {
      console.warn(`[PracticeQuiz] No questions for ${subjectName} matched class ${targetClass}. Trying without class filter.`);
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

    if (difficultyFilteredQuestions.length === 0 && difficultyLabel !== 'mixed' && classFilteredQuestions.length > 0) {
      console.warn(`[PracticeQuiz] No questions for ${subjectName} (class: ${targetClass || 'any'}) matched difficulty ${difficultyLabel}. Using from any difficulty.`);
      difficultyFilteredQuestions = [...classFilteredQuestions];
    }
    if (difficultyFilteredQuestions.length === 0) return [];

    const shuffled = shuffleArray(difficultyFilteredQuestions);
    const selected = shuffled.slice(0, numQuestionsNeeded);
    console.log(`[PracticeQuiz] Selected ${selected.length} questions for ${subjectName}.`);
    return selected;

  } catch (error) {
    console.error(`[PracticeQuiz] Overall error fetching questions for subject ${subjectName}:`, error);
    return [];
  }
};


const fetchTopicQuestions = async (topicId, quizClassFromState, difficultyLabel, numQuestionsReq, subject) => {
    try {
        // <<< CHANGE HERE: Using query parameter >>>
        const response = await apiClient.get(`/api/questions?topicId=${topicId}`);
        let fetchedQuestions = response.data;
        if (!Array.isArray(fetchedQuestions)) {
            throw new Error(`Invalid question data received for ${topicId}.`);
        }

        let classFilteredQuestions = fetchedQuestions;
        // Apply class filter only if quizClassFromState is provided and it's not for GK or Mathematics
        if (quizClassFromState && subject && subject.toLowerCase() !== 'gk' && subject.toLowerCase() !== 'mathematics') {
            classFilteredQuestions = fetchedQuestions.filter(q => !q.class || q.class === quizClassFromState);
        }


        let difficultyFilteredQuestions;
        if (difficultyLabel === 'mixed') {
            difficultyFilteredQuestions = [...classFilteredQuestions];
        } else {
            let minScore = 0, maxScore = Infinity;
            if (difficultyLabel === 'easy') { minScore = 10; maxScore = 13; }
            else if (difficultyLabel === 'medium') { minScore = 14; maxScore = 17; }
            else if (difficultyLabel === 'hard') { minScore = 18; maxScore = 20; }
            difficultyFilteredQuestions = classFilteredQuestions.filter(q => q.hasOwnProperty('difficulty') && typeof q.difficulty === 'number' && q.difficulty >= minScore && q.difficulty <= maxScore);
        }
        
        if (difficultyFilteredQuestions.length === 0 && classFilteredQuestions.length > 0 && difficultyLabel !== 'mixed') {
            console.warn(`[QuizPage] No questions for topic ${topicId} matched difficulty ${difficultyLabel}. Using questions from any difficulty for this topic.`);
            difficultyFilteredQuestions = [...classFilteredQuestions];
        }
        
        if (difficultyFilteredQuestions.length === 0) { // Check again after fallback
            throw new Error(`No questions found for topic "${topicId}" (Class: ${quizClassFromState || 'Any'}, Difficulty: "${difficultyLabel}"). Try different settings.`);
        }


        const shuffledQuestions = shuffleArray(difficultyFilteredQuestions);
        return shuffledQuestions.slice(0, numQuestionsReq);
    } catch (err) {
        console.error(`Error in fetchTopicQuestions for ${topicId}:`, err);
        throw err; 
    }
};

const fetchChallengeQuestions = async (challengeId, token) => {
    try {
        const response = await apiClient.get(`/api/challenges/${challengeId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.data || !Array.isArray(response.data.question_ids) || response.data.question_ids.length === 0) {
            throw new Error('Challenge data is invalid or contains no question IDs.');
        }
        
        // Fetch all questions for the challenge's topic_id first.
        // <<< CHANGE HERE: Using query parameter >>>
        const topicQuestionsResponse = await apiClient.get(`/api/questions?topicId=${response.data.topic_id}`, {
             headers: { Authorization: `Bearer ${token}` } // Add token if questions endpoint ever becomes protected
        });

        if (!Array.isArray(topicQuestionsResponse.data)) {
            throw new Error(`Invalid question data received for challenge topic ${response.data.topic_id}.`);
        }
        const allQuestionsForTopic = topicQuestionsResponse.data;
        
        // Filter and order these questions based on the question_ids from the challenge.
        const challengeQuestionDetails = response.data.question_ids.map(id => {
            const qDetail = allQuestionsForTopic.find(q => q.id === id);
            if (!qDetail) {
                console.warn(`Question ID ${id} from challenge not found in fetched topic questions.`);
            }
            return qDetail;
        }).filter(q => q !== undefined); // Filter out any undefined if a question ID wasn't found


        if(challengeQuestionDetails.length !== response.data.question_ids.length) {
            console.warn("Not all challenge question IDs could be matched to full question details. Some questions might be missing from the quiz.");
        }
        if(challengeQuestionDetails.length === 0) {
            throw new Error("No valid questions found for this challenge based on the provided IDs.");
        }

        // Add subject and class to challenge questions if not already present from the challengeData
        const challengeQuestionsWithContext = challengeQuestionDetails.map(q => ({
            ...q,
            subject: response.data.subject || q.subject, // Prefer challenge subject, fallback to question's
            class: response.data.quiz_class || q.class,   // Prefer challenge class, fallback to question's
        }));


        return { challengeData: response.data, questions: challengeQuestionsWithContext };
    } catch (err) {
        console.error("Error in fetchChallengeQuestions:", err);
        throw err; // Re-throw to be caught by the main fetchQuizData
    }
};


function QuizPage({ currentUser }) { 
  const { topicId, challengeId: challengeIdFromParams } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const quizSettings = location.state || {};
  const quizType = quizSettings.quizType || (challengeIdFromParams || quizSettings.challengeId ? 'challenge' : 'standard');
  const subjectFromState = quizSettings.subject;
  const difficultyLabelFromState = (quizSettings.difficulty || 'medium').toLowerCase();
  const numQuestionsReqFromState = quizSettings.numQuestions || (quizType === 'homibhabha-practice' ? quizSettings.totalQuestions : 10);
  const topicNameFromState = quizSettings.topicName || (topicId ? topicId.replace(/-/g, ' ') : 'Challenge Quiz');
  const quizClassFromState = quizSettings.quizClass;
  const timeLimitFromState = quizSettings.timeLimit;
  const questionCompositionFromState = quizSettings.questionComposition;
  const challengeIdFromState = quizSettings.challengeId || challengeIdFromParams;

  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [currentChallengeDetails, setCurrentChallengeDetails] = useState(null);
  const [effectiveTopicId, setEffectiveTopicId] = useState(topicId);
  const [effectiveSubject, setEffectiveSubject] = useState(subjectFromState);
  const [effectiveTopicName, setEffectiveTopicName] = useState(topicNameFromState);
  const [effectiveDifficulty, setEffectiveDifficulty] = useState(difficultyLabelFromState);
  const [effectiveNumQuestions, setEffectiveNumQuestions] = useState(numQuestionsReqFromState);
  const [effectiveQuizClass, setEffectiveQuizClass] = useState(quizClassFromState);
  const [effectiveTimeLimit, setEffectiveTimeLimit] = useState(timeLimitFromState);

  const currentAccentColor = subjectAccentColors[effectiveSubject?.toLowerCase()] || quizSettings.accentColor || subjectAccentColors.default;

  useEffect(() => {
    const fetchQuizData = async () => {
      setIsLoading(true);
      setError(''); setInfoMessage(''); setTimerActive(false); setElapsedTime(0);
      setUserAnswers({}); setQuestions([]); setIsSubmitting(false); setCurrentChallengeDetails(null);

      try {
        if (quizType === 'challenge' && challengeIdFromState) {
            if (!currentUser || !currentUser.token) {
                setError("You must be logged in to play a challenge.");
                setIsLoading(false);
                return;
            }
            const { challengeData, questions: challengeQuestions } = await fetchChallengeQuestions(challengeIdFromState, currentUser.token);
            setCurrentChallengeDetails(challengeData);
            setQuestions(challengeQuestions);
            setEffectiveTopicId(challengeData.topic_id);
            // Ensure subject is derived from challengeData or fallback
            setEffectiveSubject(challengeData.subject || challengeData.topic_id.split('-')[0] || 'challenge'); 
            setEffectiveTopicName(challengeData.topic_name || `Challenge #${challengeData.id}`);
            setEffectiveDifficulty(challengeData.difficulty);
            setEffectiveNumQuestions(challengeData.num_questions);
            setEffectiveQuizClass(challengeData.quiz_class);
            setEffectiveTimeLimit(challengeData.time_limit || null); 
            if (challengeQuestions.length > 0) setTimerActive(true);

        } else if (quizType === 'homibhabha-practice' && questionCompositionFromState) {
            const { questions: practiceQuestions, info: practiceInfo } = await fetchHomiBhabhaPracticeQuestions(
                quizClassFromState, difficultyLabelFromState, questionCompositionFromState, numQuestionsReqFromState
            );
            setQuestions(practiceQuestions);
            if (practiceInfo) setInfoMessage(practiceInfo);
            setEffectiveTopicId(`homibhabha-practice-${quizClassFromState}-${difficultyLabelFromState}`);
            setEffectiveSubject('homibhabha');
            setEffectiveTopicName(topicNameFromState);
            setEffectiveDifficulty(difficultyLabelFromState);
            setEffectiveNumQuestions(practiceQuestions.length);
            setEffectiveQuizClass(quizClassFromState);
            setEffectiveTimeLimit(timeLimitFromState);
            if (practiceQuestions.length > 0) setTimerActive(true);

        } else if (topicId && subjectFromState) { 
            const topicQuestions = await fetchTopicQuestions(topicId, quizClassFromState, difficultyLabelFromState, numQuestionsReqFromState, subjectFromState);
            setQuestions(topicQuestions);
            setEffectiveTopicId(topicId);
            setEffectiveSubject(subjectFromState);
            setEffectiveTopicName(topicNameFromState);
            setEffectiveDifficulty(difficultyLabelFromState);
            setEffectiveNumQuestions(topicQuestions.length); 
            setEffectiveQuizClass(quizClassFromState);
            setEffectiveTimeLimit(timeLimitFromState);
            if (topicQuestions.length > 0) setTimerActive(true);
        } else {
            setError("Quiz configuration is missing or invalid.");
        }
      } catch (err) {
          setError(`Failed to load quiz: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      }
      setIsLoading(false);
    };
    fetchQuizData();
  }, [quizType, topicId, subjectFromState, difficultyLabelFromState, numQuestionsReqFromState, topicNameFromState, 
      questionCompositionFromState, quizClassFromState, timeLimitFromState, challengeIdFromState, currentUser
  ]);

  const calculateScoreAndPercentage = useCallback(() => {
    if (questions.length === 0) return { score: 0, percentage: 0 };
    let correctAnswers = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctOptionId) {
        correctAnswers++;
      }
    });
    return {
      score: correctAnswers,
      percentage: Math.round((correctAnswers / questions.length) * 100),
    };
  }, [questions, userAnswers]);

  const submitAndNavigate = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimerActive(false);

    const { score, percentage } = calculateScoreAndPercentage();
    const questionsActuallyAttemptedIds = questions.map(q => q.id);
    const relevantUserAnswersSnapshot = {};
    questionsActuallyAttemptedIds.forEach(id => {
      relevantUserAnswersSnapshot[id] = userAnswers[id] || null;
    });

    const quizAttemptIdForDisplay = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let resultIdFromSave = null;

    const resultNavigationStateBase = {
      quizAttemptId: quizAttemptIdForDisplay,
      originalQuestionsForDisplay: questions,
      originalAnswersForDisplay: userAnswers,
      subjectAccentColor: currentAccentColor,
      subject: effectiveSubject,
      topicId: effectiveTopicId,
      difficulty: effectiveDifficulty,
      numQuestionsConfigured: effectiveNumQuestions,
      timeTaken: elapsedTime, // Use the state variable `elapsedTime`
      quizClass: effectiveQuizClass,
      isPracticeTest: quizType === 'homibhabha-practice',
      isChallenge: quizType === 'challenge' && !!currentChallengeDetails, // Make sure currentChallengeDetails is not null
      challengeDetails: quizType === 'challenge' ? currentChallengeDetails : null,
      score: score,
      percentage: percentage,
      savedToHistory: false, 
      isFirstResultView: true,
    };

    if (currentUser && currentUser.id && currentUser.token) {
      const payloadToSave = {
        userId: currentUser.id, // Use currentUser.id consistently
        subject: effectiveSubject,
        topicId: effectiveTopicId,
        score: score,
        totalQuestions: questions.length,
        percentage: percentage,
        timestamp: new Date().toISOString(),
        difficulty: effectiveDifficulty,
        numQuestionsConfigured: effectiveNumQuestions,
        class: effectiveQuizClass,
        timeTaken: elapsedTime, // Use the state variable `elapsedTime`
        questionsActuallyAttemptedIds: questionsActuallyAttemptedIds,
        userAnswersSnapshot: relevantUserAnswersSnapshot,
        challenge_id: (quizType === 'challenge' && currentChallengeDetails) ? currentChallengeDetails.id : null
      };

      try {
        const response = await apiClient.post('/api/results', payloadToSave, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        console.log('[QuizPage] Quiz results saved successfully:', response.data);
        resultNavigationStateBase.savedToHistory = true;
        resultIdFromSave = response.data.id; 

        if (quizType === 'challenge' && currentChallengeDetails && resultIdFromSave) {
            const challengeSubmitPayload = {
                score, 
                percentage, 
                timeTaken: elapsedTime, // Use the state variable `elapsedTime`
                resultId: resultIdFromSave
            };
            await apiClient.put(`/api/challenges/${currentChallengeDetails.id}/submit`, 
                challengeSubmitPayload, 
                { headers: { Authorization: `Bearer ${currentUser.token}` }}
            );
            console.log('[QuizPage] Challenge score submitted for challenge ID:', currentChallengeDetails.id);
            // Potentially update resultNavigationStateBase.challengeDetails if backend returns updated challenge
            // For now, assume frontend handles displaying "waiting for opponent" or final results based on existing data
        }
        
      } catch (error) {
        console.error('[QuizPage] Error saving quiz results or submitting challenge score:', error.response ? error.response.data : error.message);
      }
    } else {
      console.log("[QuizPage] User not logged in or token missing. Displaying result without saving.");
    }
    
    setIsSubmitting(false);
    navigate('/results', { state: resultNavigationStateBase });

  }, [userAnswers, questions, navigate, currentAccentColor, effectiveSubject, effectiveTopicId, effectiveDifficulty, effectiveNumQuestions, elapsedTime, effectiveQuizClass, isSubmitting, quizType, currentUser, calculateScoreAndPercentage, currentChallengeDetails]);

  useEffect(() => {
    let intervalId;
    if (timerActive) {
      intervalId = setInterval(() => {
        setElapsedTime(prevTime => {
          const newTime = prevTime + 1;
          if (effectiveTimeLimit && newTime >= effectiveTimeLimit) {
            clearInterval(intervalId);
            setTimerActive(false);
            submitAndNavigate(); 
            return effectiveTimeLimit;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [timerActive, effectiveTimeLimit, submitAndNavigate]);

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
        <Typography sx={{ ml: 2 }}>Loading Quiz...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate(effectiveSubject === 'homibhabha' || quizType === 'challenge' ? '/' : `/${effectiveSubject}`)} sx={{ mt: 2, borderColor: currentAccentColor, color: currentAccentColor }}>
          Back to {effectiveSubject ? effectiveSubject.charAt(0).toUpperCase() + effectiveSubject.slice(1) : 'Home'}
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
        <Button variant="outlined" onClick={() => navigate(effectiveSubject === 'homibhabha' || quizType === 'challenge' ? '/' : `/${effectiveSubject}`)} sx={{ mt: 3, borderColor: currentAccentColor, color: currentAccentColor }}>
          Back to {effectiveSubject ? effectiveSubject.charAt(0).toUpperCase() + effectiveSubject.slice(1) : 'Home'}
        </Button>
      </Box>
    );
  }

  const remainingTime = effectiveTimeLimit ? Math.max(0, effectiveTimeLimit - elapsedTime) : elapsedTime;
  const displayTime = effectiveTimeLimit ? remainingTime : elapsedTime;

  const baseTimerColorForAlpha = effectiveTimeLimit && remainingTime < 600
    ? theme.palette.error.main
    : theme.palette.text.primary;
  const timerDisplayTextColor = effectiveTimeLimit && remainingTime < 600
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
            {effectiveTimeLimit ? 'Time Left: ' : 'Time: '} {formatTime(displayTime)}
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
          mt: !infoMessage && ((timerActive || elapsedTime > 0) && questions.length > 0) ? theme.spacing(8) : ((timerActive || elapsedTime > 0) && questions.length > 0 ? theme.spacing(1) : theme.spacing(4.5))
        }}
      >
        {quizType === 'challenge' && currentChallengeDetails ? `Challenge: ${currentChallengeDetails.topic_name || 'Quiz'}` : 
         (effectiveSubject ? `${effectiveSubject.charAt(0).toUpperCase() + effectiveSubject.slice(1)} Quiz` : 'Quiz')}
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
        {quizType !== 'challenge' && `Topic: ${effectiveTopicName}`}
        {quizType === 'challenge' && currentChallengeDetails && 
            `Challenged by: ${currentChallengeDetails.challenger_id === currentUser?.id ? 
                (currentChallengeDetails.challengedUsername ? `You challenged ${currentChallengeDetails.challengedUsername}` : 'Awaiting opponent') 
                : 
                (currentChallengeDetails.challengerUsername || 'A User')}`
        }
        {effectiveQuizClass && ` (Class ${effectiveQuizClass})`}
        {' '}({effectiveDifficulty}, {questions.length} Questions)
      </Typography>
      {quizType === 'challenge' && currentChallengeDetails && currentChallengeDetails.challenger_id !== currentUser?.id && currentChallengeDetails.challenger_score !== null && (
          <Alert severity="info" sx={{mb: 2}}>
              Your friend {currentChallengeDetails.challengerUsername || 'Your opponent'} has already completed this challenge, scoring {currentChallengeDetails.challenger_score}/{currentChallengeDetails.num_questions}. Good luck!
          </Alert>
      )}


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

// --- END OF FILE src/pages/QuizPage.js ---