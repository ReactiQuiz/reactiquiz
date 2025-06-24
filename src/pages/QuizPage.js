// src/pages/QuizPage.js
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert
} from '@mui/material';
import {
  useParams, useNavigate, useLocation
} from 'react-router-dom';
import {
  darken, useTheme
} from '@mui/material/styles';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

import {
  subjectAccentColors as themeSubjectAccentColors
} from '../theme';
import { parseQuestionOptions, shuffleArray } from '../utils/quizUtils';

// Import separated components
import QuizHeader from '../components/quiz/QuizHeader';
import QuizQuestionList from '../components/quiz/QuizQuestionList';

const subjectAccentColors = themeSubjectAccentColors;

// Helper function to fetch questions for Homi Bhabha practice tests
const fetchAndFilterSubjectQuestionsForPractice = async (subjectName, targetClass, difficultyLabel, numQuestionsNeeded) => {
  // console.log(`[PracticeQuiz] Fetching for subject: ${subjectName}, class: ${targetClass}, difficulty: ${difficultyLabel}, needed: ${numQuestionsNeeded}`);
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
        const questionsResponse = await apiClient.get(`/api/questions?topicId=${topicId}`);
        if (Array.isArray(questionsResponse.data)) {
          // Find the topic info from the initial topicsResponse, not the questionsResponse
          const correctTopicInfo = topicsResponse.data.find(t => t.id === topicId);
          const questionsWithContext = questionsResponse.data.map(q => ({
            ...q,
            subject: subjectName.toLowerCase(),
            class: q.class || correctTopicInfo?.class || null
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
        !q.class || String(q.class) === String(targetClass) // Ensure type consistency for comparison
      );
    }
    if (classFilteredQuestions.length === 0 && targetClass) {
      console.warn(`[PracticeQuiz] No questions for ${subjectName} matched class ${targetClass}. Trying without class filter.`);
      classFilteredQuestions = allQuestionsForSubject; // Fallback to all questions for subject if class filter yields none
    }
    if (classFilteredQuestions.length === 0) return [];


    let difficultyFilteredQuestions;
    if (difficultyLabel === 'mixed') {
      difficultyFilteredQuestions = [...classFilteredQuestions];
    } else {
      let minScore = 0, maxScore = Infinity;
      if (difficultyLabel === 'easy') { minScore = 10; maxScore = 13; }
      else if (difficultyLabel === 'medium') { minScore = 14; maxScore = 17; }
      else if (difficultyLabel === 'hard') { minScore = 18; maxScore = 20; }
      difficultyFilteredQuestions = classFilteredQuestions.filter(q =>
        q.hasOwnProperty('difficulty') && typeof q.difficulty === 'number' &&
        q.difficulty >= minScore && q.difficulty <= maxScore
      );
    }

    if (difficultyFilteredQuestions.length === 0 && difficultyLabel !== 'mixed' && classFilteredQuestions.length > 0) {
      console.warn(`[PracticeQuiz] No questions for ${subjectName} (class: ${targetClass || 'any'}) matched difficulty ${difficultyLabel}. Using questions from any difficulty for this subject and class.`);
      difficultyFilteredQuestions = [...classFilteredQuestions]; // Fallback to class-filtered if specific difficulty not found
    }
    if (difficultyFilteredQuestions.length === 0) return []; // No questions match criteria

    const shuffled = shuffleArray(difficultyFilteredQuestions);
    const selected = shuffled.slice(0, numQuestionsNeeded);
    // console.log(`[PracticeQuiz] Selected ${selected.length} questions for ${subjectName}.`);
    return selected;
  } catch (error) {
    console.error(`[PracticeQuiz] Overall error fetching questions for subject ${subjectName}:`, error);
    return [];
  }
};

const fetchHomiBhabhaPracticeQuestions = async (quizClassFromState, difficultyLabel, questionComposition, desiredTotal) => {
  let finalQuizQuestions = [];
  let totalFetchedCount = 0;
  let infoMessages = [];
  const subjectOrder = ['physics', 'chemistry', 'biology', 'gk']; // Define order for consistency

  for (const subjKey of subjectOrder) {
    if (questionComposition[subjKey]) {
      const countNeeded = questionComposition[subjKey];
      try {
        const subjectQuestions = await fetchAndFilterSubjectQuestionsForPractice(subjKey, quizClassFromState, difficultyLabel, countNeeded);
        finalQuizQuestions.push(...subjectQuestions);
        totalFetchedCount += subjectQuestions.length;
        if (subjectQuestions.length < countNeeded) {
          infoMessages.push(`Could not find all ${countNeeded} ${difficultyLabel} questions for ${subjKey} (Class ${quizClassFromState || 'Any'}); got ${subjectQuestions.length}.`);
        }
      } catch (err) {
        console.warn(`Error fetching Homi Bhabha questions for subject ${subjKey}:`, err);
        infoMessages.push(`Could not fetch questions for ${subjKey}.`);
      }
    }
  }

  const uniqueQuestionsMap = new Map();
  finalQuizQuestions.forEach(q => { if (q && q.id && !uniqueQuestionsMap.has(q.id)) uniqueQuestionsMap.set(q.id, q); });
  let uniqueFinalQuizQuestions = Array.from(uniqueQuestionsMap.values());

  // If not enough unique questions, shuffle and pick to meet desiredTotal if possible
  if (uniqueFinalQuizQuestions.length < desiredTotal && uniqueFinalQuizQuestions.length > 0) {
      console.warn(`[HomiBhabha] Not enough unique questions (${uniqueFinalQuizQuestions.length}/${desiredTotal}). Shuffling and taking up to desired total.`);
      uniqueFinalQuizQuestions = shuffleArray(uniqueFinalQuizQuestions).slice(0, desiredTotal);
  } else if (uniqueFinalQuizQuestions.length > desiredTotal) {
      uniqueFinalQuizQuestions = shuffleArray(uniqueFinalQuizQuestions).slice(0, desiredTotal);
  }


  if (uniqueFinalQuizQuestions.length === 0) {
    throw new Error(`Could not gather any questions for the Homi Bhabha practice test. Please try different settings or check question availability.`);
  }
  if (uniqueFinalQuizQuestions.length < desiredTotal) { // Check after potential slicing
    infoMessages.push(`Total questions for Homi Bhabha test is ${uniqueFinalQuizQuestions.length} instead of desired ${desiredTotal}. Some subjects might have fewer questions than requested.`);
  }
  return { questions: uniqueFinalQuizQuestions, info: infoMessages.join(' ') };
};

const fetchTopicQuestions = async (topicId, quizClassFromState, difficultyLabel, numQuestionsReq, subject) => {
  try {
    const response = await apiClient.get(`/api/questions?topicId=${topicId}`);
    let fetchedQuestions = response.data;
    if (!Array.isArray(fetchedQuestions)) {
      throw new Error(`Invalid question data received for ${topicId}.`);
    }

    let classFilteredQuestions = fetchedQuestions;
    // Apply class filter only if quizClassFromState is provided and subject is not GK/Maths (which might not have classes)
    if (quizClassFromState && subject && subject.toLowerCase() !== 'gk' && subject.toLowerCase() !== 'mathematics') {
      classFilteredQuestions = fetchedQuestions.filter(q => !q.class || String(q.class) === String(quizClassFromState));
    }

    let difficultyFilteredQuestions;
    if (difficultyLabel === 'mixed') {
      difficultyFilteredQuestions = [...classFilteredQuestions];
    } else {
      let minScore = 0, maxScore = Infinity;
      if (difficultyLabel === 'easy') { minScore = 10; maxScore = 13; }
      else if (difficultyLabel === 'medium') { minScore = 14; maxScore = 17; }
      else if (difficultyLabel === 'hard') { minScore = 18; maxScore = 20; }
      difficultyFilteredQuestions = classFilteredQuestions.filter(q =>
        q.hasOwnProperty('difficulty') && typeof q.difficulty === 'number' &&
        q.difficulty >= minScore && q.difficulty <= maxScore
      );
    }

    if (difficultyFilteredQuestions.length === 0 && classFilteredQuestions.length > 0 && difficultyLabel !== 'mixed') {
      console.warn(`[QuizPage] No questions for topic ${topicId} (Class: ${quizClassFromState || 'Any'}) matched difficulty ${difficultyLabel}. Using questions from any difficulty for this topic.`);
      difficultyFilteredQuestions = [...classFilteredQuestions]; // Fallback to class-filtered
    }

    if (difficultyFilteredQuestions.length === 0) {
      // If still no questions, try fetching without class and difficulty filters as a last resort for this topicId
      console.warn(`[QuizPage] No questions found for topic ${topicId} with class/difficulty. Fetching all for topic.`);
      difficultyFilteredQuestions = [...fetchedQuestions]; // Use all fetched for the topic
      if (difficultyFilteredQuestions.length === 0) {
         throw new Error(`No questions found at all for topic "${topicId}". Try different settings.`);
      }
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

    // Fetch all questions for the challenge's topicId to get full details
    const topicQuestionsResponse = await apiClient.get(`/api/questions?topicId=${response.data.topic_id}`, {
      // No token needed if questions are public, or add token if questions are protected
      // headers: { Authorization: `Bearer ${token}` } // Optional, depends on your /api/questions security
    });

    if (!Array.isArray(topicQuestionsResponse.data)) {
      throw new Error(`Invalid question data received for challenge topic ${response.data.topic_id}.`);
    }
    const allQuestionsForTopic = topicQuestionsResponse.data;

    const challengeQuestionDetails = response.data.question_ids.map(id => {
      return allQuestionsForTopic.find(q => q.id === id);
    }).filter(q => q !== undefined); // Filter out any undefined if an ID wasn't found

    if (challengeQuestionDetails.length !== response.data.question_ids.length) {
      console.warn("[QuizPage] Not all challenge question IDs could be matched to full question details. Some questions may be missing.");
    }
    if (challengeQuestionDetails.length === 0) {
      throw new Error("[QuizPage] No valid questions found for this challenge based on the provided IDs. The original questions may have been removed or changed.");
    }

    // Add context like subject and class from the challenge data to each question
    const challengeQuestionsWithContext = challengeQuestionDetails.map(q => ({
      ...q,
      subject: response.data.subject || q.subject, // Prefer challenge's subject
      class: response.data.quiz_class || q.class,   // Prefer challenge's class
    }));

    return { challengeData: response.data, questions: challengeQuestionsWithContext };
  } catch (err) {
    console.error("[QuizPage] Error in fetchChallengeQuestions:", err);
    throw err;
  }
};

function QuizPage() {
  const { currentUser } = useAuth();
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
  const [effectiveNumQuestionsConfigured, setEffectiveNumQuestionsConfigured] = useState(numQuestionsReqFromState);
  const [effectiveQuizClass, setEffectiveQuizClass] = useState(quizClassFromState);
  const [effectiveTimeLimit, setEffectiveTimeLimit] = useState(timeLimitFromState);

  const currentAccentColor = subjectAccentColors[effectiveSubject?.toLowerCase()] || quizSettings.accentColor || subjectAccentColors.default;

  useEffect(() => {
    const fetchQuizData = async () => {
      setIsLoading(true);
      setError(''); setInfoMessage(''); setTimerActive(false); setElapsedTime(0);
      setUserAnswers({}); setQuestions([]); setIsSubmitting(false); setCurrentChallengeDetails(null);

      try {
        let rawFetchedQuestions = [];

        if (quizType === 'challenge' && challengeIdFromState) {
            if (!currentUser || !currentUser.token) {
                setError("You must be logged in to play a challenge."); setIsLoading(false); return;
            }
            const { challengeData, questions: challengeQuestionsData } = await fetchChallengeQuestions(challengeIdFromState, currentUser.token);
            setCurrentChallengeDetails(challengeData); rawFetchedQuestions = challengeQuestionsData;
            setEffectiveTopicId(challengeData.topic_id);
            setEffectiveSubject(challengeData.subject || challengeData.topic_id.split('-')[0] || 'challenge');
            setEffectiveTopicName(challengeData.topic_name || `Challenge #${challengeData.id}`);
            setEffectiveDifficulty(challengeData.difficulty);
            setEffectiveNumQuestionsConfigured(challengeData.num_questions);
            setEffectiveQuizClass(challengeData.quiz_class);
            setEffectiveTimeLimit(challengeData.time_limit || null);
        } else if (quizType === 'homibhabha-practice' && questionCompositionFromState) {
            const { questions: practiceQuestionsData, info: practiceInfo } = await fetchHomiBhabhaPracticeQuestions(
                quizClassFromState, difficultyLabelFromState, questionCompositionFromState, numQuestionsReqFromState);
            rawFetchedQuestions = practiceQuestionsData;
            if (practiceInfo) setInfoMessage(practiceInfo);
            setEffectiveTopicId(`homibhabha-practice-${quizClassFromState}-${difficultyLabelFromState}`);
            setEffectiveSubject('homibhabha');
            setEffectiveTopicName(topicNameFromState);
            setEffectiveDifficulty(difficultyLabelFromState);
            setEffectiveNumQuestionsConfigured(numQuestionsReqFromState);
            setEffectiveQuizClass(quizClassFromState);
            setEffectiveTimeLimit(timeLimitFromState);
        } else if (topicId && subjectFromState) {
            rawFetchedQuestions = await fetchTopicQuestions(topicId, quizClassFromState, difficultyLabelFromState, numQuestionsReqFromState, subjectFromState);
            setEffectiveTopicId(topicId);
            setEffectiveSubject(subjectFromState);
            setEffectiveTopicName(topicNameFromState);
            setEffectiveDifficulty(difficultyLabelFromState);
            setEffectiveNumQuestionsConfigured(numQuestionsReqFromState);
            setEffectiveQuizClass(quizClassFromState);
            setEffectiveTimeLimit(timeLimitFromState);
        } else { setError("Quiz configuration is missing or invalid."); }

        const questionsWithParsedOptions = parseQuestionOptions(rawFetchedQuestions);
        setQuestions(questionsWithParsedOptions);
        if (questionsWithParsedOptions.length > 0) setTimerActive(true);
      } catch (err) { setError(`Failed to load quiz: ${err.response?.data?.message || err.message || 'Unknown error'}`); }
      setIsLoading(false);
    };
    fetchQuizData();
  }, [quizType, topicId, subjectFromState, difficultyLabelFromState, numQuestionsReqFromState, topicNameFromState,
      questionCompositionFromState, quizClassFromState, timeLimitFromState, challengeIdFromState, currentUser]);


  const calculateScoreAndPercentage = useCallback(() => {
    if (questions.length === 0) return { score: 0, percentage: 0 };
    let correctAnswers = 0;
    questions.forEach(q => { if (q && q.id && userAnswers[q.id] === q.correctOptionId) correctAnswers++; });
    return { score: correctAnswers, percentage: Math.round((correctAnswers / questions.length) * 100) };
  }, [questions, userAnswers]);

  const submitAndNavigate = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true); setTimerActive(false);
    const { score, percentage } = calculateScoreAndPercentage();
    const questionsActuallyAttemptedIds = questions.map(q => q.id);
    const relevantUserAnswersSnapshot = {};
    questionsActuallyAttemptedIds.forEach(id => { relevantUserAnswersSnapshot[id] = userAnswers[id] || null; });
    const quizAttemptIdForDisplay = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let resultIdFromSave = null;

    const resultNavigationStateBase = {
      quizAttemptId: quizAttemptIdForDisplay, originalQuestionsForDisplay: questions,
      originalAnswersForDisplay: userAnswers, subjectAccentColor: currentAccentColor,
      subject: effectiveSubject, topicId: effectiveTopicId, difficulty: effectiveDifficulty,
      numQuestionsConfigured: effectiveNumQuestionsConfigured,
      actualNumQuestionsInQuiz: questions.length,
      timeTaken: elapsedTime, quizClass: effectiveQuizClass,
      isPracticeTest: quizType === 'homibhabha-practice',
      isChallenge: quizType === 'challenge' && !!currentChallengeDetails,
      challengeDetails: quizType === 'challenge' ? currentChallengeDetails : null,
      score: score, percentage: percentage, savedToHistory: false, isFirstResultView: true,
    };

    if (currentUser && currentUser.id && currentUser.token) {
      const payloadToSave = {
        userId: currentUser.id, subject: effectiveSubject, topicId: effectiveTopicId, score: score,
        totalQuestions: questions.length, percentage: percentage, timestamp: new Date().toISOString(),
        difficulty: effectiveDifficulty, numQuestionsConfigured: effectiveNumQuestionsConfigured,
        class: effectiveQuizClass, timeTaken: elapsedTime,
        questionsActuallyAttemptedIds: questionsActuallyAttemptedIds,
        userAnswersSnapshot: relevantUserAnswersSnapshot,
        challenge_id: (quizType === 'challenge' && currentChallengeDetails) ? currentChallengeDetails.id : null
      };
      try {
        const response = await apiClient.post('/api/results', payloadToSave, { headers: { Authorization: `Bearer ${currentUser.token}` }});
        resultNavigationStateBase.savedToHistory = true; resultIdFromSave = response.data.id;
        if (quizType === 'challenge' && currentChallengeDetails && resultIdFromSave) {
          const challengeSubmitPayload = { score, percentage, timeTaken: elapsedTime, resultId: resultIdFromSave };
          await apiClient.put(`/api/challenges/${currentChallengeDetails.id}/submit`, challengeSubmitPayload, { headers: { Authorization: `Bearer ${currentUser.token}` }});
        }
      } catch (error) { console.error('[QuizPage] Error saving/submitting challenge:', error.response?.data || error.message); }
    }
    setIsSubmitting(false); navigate('/results', { state: resultNavigationStateBase });
  }, [userAnswers, questions, navigate, currentAccentColor, effectiveSubject, effectiveTopicId, effectiveDifficulty, effectiveNumQuestionsConfigured, elapsedTime, effectiveQuizClass, isSubmitting, quizType, currentUser, calculateScoreAndPercentage, currentChallengeDetails]);

  useEffect(() => {
    let intervalId;
    if (timerActive && questions.length > 0) {
      intervalId = setInterval(() => {
        setElapsedTime(prevTime => {
          const newTime = prevTime + 1;
          if (effectiveTimeLimit && newTime >= effectiveTimeLimit) {
            clearInterval(intervalId); setTimerActive(false);
            if (!isSubmitting) submitAndNavigate();
            return effectiveTimeLimit;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [timerActive, effectiveTimeLimit, submitAndNavigate, questions.length, isSubmitting]);

  const handleOptionSelectForQuestion = (questionId, selectedOptionId) => {
    setUserAnswers(prevAnswers => ({ ...prevAnswers, [questionId]: selectedOptionId }));
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
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate(effectiveSubject === 'homibhabha' || quizType === 'challenge' ? '/' : `/subjects/${effectiveSubject.toLowerCase()}`)} sx={{ mt: 2, borderColor: currentAccentColor, color: currentAccentColor }}>
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
        <Button variant="outlined" onClick={() => navigate(effectiveSubject === 'homibhabha' || quizType === 'challenge' ? '/' : `/subjects/${effectiveSubject.toLowerCase()}`)} sx={{ mt: 3, borderColor: currentAccentColor, color: currentAccentColor }}>
          Back to {effectiveSubject ? effectiveSubject.charAt(0).toUpperCase() + effectiveSubject.slice(1) : 'Home'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '900px', margin: 'auto' }}>
      <QuizHeader
        quizType={quizType}
        effectiveSubject={effectiveSubject}
        effectiveTopicName={effectiveTopicName}
        effectiveQuizClass={effectiveQuizClass}
        effectiveDifficulty={effectiveDifficulty}
        questionsLength={questions.length}
        currentChallengeDetails={currentChallengeDetails}
        currentUser={currentUser}
        timerActive={timerActive}
        elapsedTime={elapsedTime}
        effectiveTimeLimit={effectiveTimeLimit}
        accentColor={currentAccentColor}
        infoMessage={infoMessage}
      />

      <QuizQuestionList
        questions={questions}
        userAnswers={userAnswers}
        onOptionSelect={handleOptionSelectForQuestion}
        currentAccentColor={currentAccentColor}
      />

      <Box display="flex" justifyContent="center" sx={{ mt: 3, mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={submitAndNavigate}
          disabled={isSubmitting || questions.length === 0}
          sx={{
            backgroundColor: currentAccentColor,
            color: theme.palette.getContrastText(currentAccentColor),
            '&:hover': { backgroundColor: darken(currentAccentColor, 0.15) },
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