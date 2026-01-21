// src/components/results/HistoricalResultDetailView.tsx
/**
 * Historical Result Detail View Component
 * 
 * This component displays the detailed view of a historical quiz result.
 * It fetches the result and questions data, then displays the summary,
 * breakdown, and action buttons.
 */
import React from 'react';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axiosInstance';
import QuizResultSummary from './QuizResultSummary';
import QuestionBreakdown from './QuestionBreakdown';
import ResultsActionButtons from './ResultsActionButtons';
import { QuizResult, Question } from '../../types';
import { parseQuestionOptions } from '../../utils/quizUtils';

/**
 * HistoricalResultDetailViewProps Interface
 * 
 * Props for the HistoricalResultDetailView component.
 */
interface HistoricalResultDetailViewProps {
  resultId: string; // ID of the result to display
  onBack: () => void; // Callback to navigate back
  accentColor: string; // Accent color for styling
}

/**
 * Fetch Result By ID
 * 
 * Fetches a single quiz result by ID from the API.
 * Parses nested JSON strings from the database.
 * 
 * @param {string} resultId - Result ID to fetch
 * @returns {Promise<QuizResult|null>} Quiz result object or null
 */
const fetchResultById = async (resultId: string): Promise<QuizResult | null> => {
  if (!resultId) return null;
  const { data } = await apiClient.get(`/api/results/${resultId}`);
  // Parse nested JSON strings from the database
  data.questionsActuallyAttemptedIds = JSON.parse(data.questionsActuallyAttemptedIds || '[]');
  data.userAnswersSnapshot = JSON.parse(data.userAnswersSnapshot || '{}');
  return data;
};

/**
 * Fetch Questions By IDs
 * 
 * Fetches questions by their IDs from the API.
 * Parses question options from JSON strings.
 * 
 * @param {string[]} questionIds - Array of question IDs
 * @returns {Promise<Question[]>} Array of question objects
 */
const fetchQuestionsByIds = async (questionIds: string[]): Promise<Question[]> => {
  if (!questionIds || questionIds.length === 0) return [];
  const { data } = await apiClient.get(`/api/questions?ids=${questionIds.join(',')}`);
  return parseQuestionOptions(data || []);
};

/**
 * Historical Result Detail View Component
 * 
 * Displays the detailed view of a historical quiz result with:
 * - Result data fetching (React Query)
 * - Questions data fetching (depends on result)
 * - Quiz result summary
 * - Question breakdown
 * - Action buttons (Back, Home, Challenge Setup)
 * - Loading states
 * - Error handling
 * 
 * This component is used on the ResultsDetailPage to display
 * a detailed view of a historical quiz result.
 * 
 * @param {HistoricalResultDetailViewProps} props - Component props
 * @returns {JSX.Element} Historical result detail view
 */
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

  const combinedError = resultError || questionsError;
  if (combinedError) {
    const errorMessage = (combinedError as any)?.response?.data?.message || (combinedError as Error).message || 'Failed to load result details.';
    return <Alert severity="error">{errorMessage}</Alert>;
  }

  if (!result || !questions) {
    return <Alert severity="warning">Could not find data for this quiz result.</Alert>;
  }

  // 3. Combine the data to create the detailed breakdown for the component
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