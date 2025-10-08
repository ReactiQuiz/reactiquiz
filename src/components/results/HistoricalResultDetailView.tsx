// src/components/results/HistoricalResultDetailView.tsx
import React from 'react';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axiosInstance';
import QuizResultSummary from './QuizResultSummary';
import QuestionBreakdown from './QuestionBreakdown';
import ResultsActionButtons from './ResultsActionButtons';
import { QuizResult, Question } from '../../types';
import { parseQuestionOptions } from '../../utils/quizUtils';

interface HistoricalResultDetailViewProps {
  resultId: string;
  onBack: () => void;
  accentColor: string;
}

// Fetcher function for a single result
const fetchResultById = async (resultId: string): Promise<QuizResult | null> => {
  if (!resultId) return null;
  const { data } = await apiClient.get(`/api/results/${resultId}`);
  // Parse nested JSON strings from the database
  data.questionsActuallyAttemptedIds = JSON.parse(data.questionsActuallyAttemptedIds || '[]');
  data.userAnswersSnapshot = JSON.parse(data.userAnswersSnapshot || '{}');
  return data;
};

// Fetcher function for a set of questions by their IDs
const fetchQuestionsByIds = async (questionIds: string[]): Promise<Question[]> => {
  if (!questionIds || questionIds.length === 0) return [];
  const { data } = await apiClient.get(`/api/questions?ids=${questionIds.join(',')}`);
  // The backend already parses options, but we can double-check here
  return parseQuestionOptions(data || []);
};

const HistoricalResultDetailView: React.FC<HistoricalResultDetailViewProps> = ({ resultId, onBack, accentColor }) => {
  // 1. Fetch the specific quiz result
  const { data: result, isLoading: isLoadingResult, error: resultError } = useQuery({
    queryKey: ['quizResult', resultId],
    queryFn: () => fetchResultById(resultId),
    enabled: !!resultId,
  });

  // 2. Fetch the full question details once the result is loaded
  const { data: questions, isLoading: isLoadingQuestions, error: questionsError } = useQuery({
    queryKey: ['questionsForRfid', resultId],
    queryFn: () => fetchQuestionsByIds(result!.questionsActuallyAttemptedIds),
    enabled: !!result, // Only run this query when the result data is available
  });

  if (isLoadingResult || isLoadingQuestions) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (resultError || questionsError) {
    return <Alert severity="error">{(resultError || questionsError)?.message || 'Failed to load result details.'}</Alert>;
  }

  if (!result || !questions) {
    return <Alert severity="warning">Could not find data for this quiz result.</Alert>;
  }

  // 3. Combine the data to create the detailed breakdown for the component
  const detailedQuestions = questions.map(question => {
    const userAnswerId = result.userAnswersSnapshot[question.id];
    const isCorrect = userAnswerId === question.correctOptionId;
    return { ...question, userAnswerId, isCorrect, isAnswered: userAnswerId !== undefined };
  });

  return (
    <Box>
      <Button onClick={onBack} sx={{ mb: 2 }}>
        &larr; Back to History
      </Button>
      
      <QuizResultSummary
        quizResult={result}
        quizTitle="Saved Result"
        accentColor={accentColor}
      />
      
      <QuestionBreakdown detailedQuestions={detailedQuestions} />
      
      <ResultsActionButtons
        onBackToList={onBack}
        showBackToListButton={true}
        onNavigateHome={() => window.location.href = '/'}
        accentColor={accentColor}
      />
    </Box>
  );
};

export default HistoricalResultDetailView;