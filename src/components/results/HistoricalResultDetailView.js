// src/components/results/HistoricalResultDetailView.js
import React from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import QuizResultSummary from './QuizResultSummary'; // Assuming path
import QuestionBreakdown from './QuestionBreakdown';
import ResultsActionButtons from './ResultsActionButtons';
import { subjectAccentColors } from '../../theme'; // Assuming path

function HistoricalResultDetailView({
  selectedResult,
  detailedQuestions, // This is processedHistoricalDetailedView from parent
  isLoadingDetails,
  detailsError,
  onBackToList,
  onNavigateHome,
  onOpenDeleteDialog,
  onOpenChallengeSetup,
  currentUser,
  accentColor // Overall page accent
}) {
  if (!selectedResult) return null; // Should not happen if rendered

  const itemAccentColor = subjectAccentColors[selectedResult.subject?.toLowerCase()] || accentColor;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
      <QuizResultSummary
        quizResult={selectedResult} // selectedResult should have a pre-formatted topicName
        quizTitle={selectedResult.challenge_id ? "Past Challenge Details" : "Past Quiz Details"}
        accentColor={itemAccentColor}
      />
      {isLoadingDetails ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="20vh" sx={{ my: 2 }}>
          <CircularProgress sx={{ color: itemAccentColor }} />
          <Typography sx={{ ml: 2 }}>Loading question details...</Typography>
        </Box>
      ) : detailsError ? (
        <Alert severity="error" sx={{ mt: 2 }}>{detailsError}</Alert>
      ) : detailedQuestions && detailedQuestions.length > 0 ? (
        <QuestionBreakdown detailedQuestionsToDisplay={detailedQuestions} />
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          No detailed question breakdown available or no questions were attempted for this result.
        </Alert>
      )}
      <ResultsActionButtons
        onBackToList={onBackToList}
        onNavigateHome={onNavigateHome}
        showBackToListButton={true}
        accentColor={itemAccentColor}
        showDeleteButton={currentUser && currentUser.id === selectedResult.userId}
        onDeleteClick={() => onOpenDeleteDialog(selectedResult.id)}
        deleteDisabled={!selectedResult.id || !(currentUser && currentUser.id === selectedResult.userId)}
        onChallengeFriend={() => onOpenChallengeSetup(selectedResult)}
        showChallengeButton={currentUser && !!selectedResult.questionsActuallyAttemptedIds && selectedResult.questionsActuallyAttemptedIds.length > 0 && !selectedResult.challenge_id}
      />
    </Box>
  );
}

export default HistoricalResultDetailView;