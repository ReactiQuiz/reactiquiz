// src/components/results/HistoricalResultDetailView.tsx
/**
 * Historical Result Detail View Component
 * 
 * Fetches and displays detailed performance data for a single historical quiz result.
 */
import React from 'react';
import { Box, Button, CircularProgress, Alert, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axiosInstance';
import QuizResultSummary from './QuizResultSummary';
import QuestionBreakdown from './QuestionBreakdown';
import ResultsActionButtons from './ResultsActionButtons';
import { QuizResult, Question } from '../../types';
import { parseQuestionOptions } from '../../utils/quizUtils';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';
import { useTopics } from '../../contexts/TopicsContext';

interface HistoricalResultDetailViewProps {
  resultId: string;
  onBack: () => void;
  accentColor: string;
}

const fetchResultById = async (resultId: string): Promise<QuizResult | null> => {
  if (!resultId) return null;
  const { data } = await apiClient.get(`/api/results/${resultId}`);
  data.questionsActuallyAttemptedIds = typeof data.questionsActuallyAttemptedIds === 'string'
    ? JSON.parse(data.questionsActuallyAttemptedIds || '[]')
    : (data.questionsActuallyAttemptedIds || []);
  data.userAnswersSnapshot = typeof data.userAnswersSnapshot === 'string'
    ? JSON.parse(data.userAnswersSnapshot || '{}')
    : (data.userAnswersSnapshot || {});
  return data;
};

const fetchQuestionsByIds = async (questionIds: string[]): Promise<Question[]> => {
  if (!questionIds || questionIds.length === 0) return [];
  const { data } = await apiClient.get(`/api/questions?ids=${questionIds.join(',')}`);
  return parseQuestionOptions(data || []);
};

const HistoricalResultDetailView: React.FC<HistoricalResultDetailViewProps> = ({ resultId, onBack }) => {
  const { getColor } = useSubjectColors();
  const { topics: allTopics } = useTopics();

  const { data: rawResult, isLoading: isLoadingResult, error: resultError } = useQuery({
    queryKey: ['quizResult', resultId],
    queryFn: () => fetchResultById(resultId),
    enabled: !!resultId,
  });

  const { data: questions, isLoading: isLoadingQuestions, error: questionsError } = useQuery({
    queryKey: ['questionsForRfid', resultId],
    queryFn: () => fetchQuestionsByIds(rawResult!.questionsActuallyAttemptedIds),
    enabled: !!rawResult,
  });

  if (isLoadingResult || isLoadingQuestions) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2, fontWeight: 600 }}>Loading result details...</Typography>
      </Box>
    );
  }

  const combinedError = resultError || questionsError;
  if (combinedError) {
    const errorMessage = (combinedError as any)?.response?.data?.message || (combinedError as Error).message || 'Failed to load result details.';
    return <Alert severity="error">{errorMessage}</Alert>;
  }

  if (!rawResult || !questions) {
    return <Alert severity="warning">Could not find data for this quiz result.</Alert>;
  }

  // Enrich topicName and subject
  const topic = allTopics.find(t => t.id === rawResult.topicId);
  let resolvedTopicName = topic?.name || rawResult.topicName;
  if (!resolvedTopicName || resolvedTopicName === 'Unknown Topic') {
    if (rawResult.topicId && rawResult.topicId.startsWith('pyq-')) {
      const parts = rawResult.topicId.split('-');
      resolvedTopicName = `Homi Bhabha PYQ Std ${parts[1]}th (${parts[2]})`;
    } else if (rawResult.topicId && rawResult.topicId.startsWith('homibhabha-practice-')) {
      const parts = rawResult.topicId.split('-');
      resolvedTopicName = `Homi Bhabha Practice Test - Std ${parts[2]}th`;
    } else if (rawResult.topicId) {
      resolvedTopicName = rawResult.topicId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    } else {
      resolvedTopicName = 'Practice Quiz';
    }
  }

  const result: QuizResult = {
    ...rawResult,
    topicName: resolvedTopicName,
    subject: topic?.subject_id || rawResult.subject || 'general',
    class: topic?.class || (rawResult.class ? `Class ${rawResult.class}` : undefined),
  };

  const themeAccentColor = getColor(result.subject);

  const detailedQuestions = questions.map(question => {
    const userAnswerIndex = result.userAnswersSnapshot[question.id];
    let userAnswerId = null;
    if (userAnswerIndex !== undefined && Array.isArray(question.options) && question.options[userAnswerIndex]) {
      userAnswerId = (question.options[userAnswerIndex] as { id: string }).id;
    }
    const isCorrect = userAnswerId === question.correctOptionId;
    return { ...question, userAnswerId, isCorrect, isAnswered: userAnswerIndex !== undefined };
  });

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        variant="outlined"
        size="small"
        sx={{ mb: 3, borderRadius: 2 }}
      >
        Back to History
      </Button>

      <QuizResultSummary
        quizResult={result}
        quizTitle={result.topicName}
        accentColor={themeAccentColor}
      />

      <QuestionBreakdown detailedQuestions={detailedQuestions} />

      <ResultsActionButtons
        onBackToList={onBack}
        showBackToListButton={true}
        onNavigateHome={() => window.location.href = '/dashboard'}
        accentColor={themeAccentColor}
        showDeleteButton={false}
        onDeleteClick={() => {}}
        deleteDisabled={true}
        onViewHistory={() => {}}
        showViewHistoryButton={false}
      />
    </Box>
  );
};

export default HistoricalResultDetailView;