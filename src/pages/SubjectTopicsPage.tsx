// src/pages/SubjectTopicsPage.tsx
import React from 'react';
import { Box, Alert, Grid } from '@mui/material';
import { useSubjectTopics } from '../hooks/useSubjectTopics';
import { useSubjectColors } from '../contexts/SubjectColorsContext';
import TopicCard from '../components/topics/TopicCard';
import QuizSettingsModal from '../components/quiz/QuizSettingsModal';
import QuestionsPdfModal from '../components/quiz/QuestionsPdfModal';
import TopicSkeletonGrid from '../components/topics/TopicSkeletonGrid';
import TopicFilters from '../components/topics/TopicFilters';
import SubjectBreadcrumb from '../components/topics/SubjectBreadcrumb';

const SubjectTopicsPage: React.FC = () => {
  const {
    subjectKey, currentSubject, isLoading, error,
    modalOpen, selectedTopicForQuiz, pdfModalOpen, selectedTopicForPdf,
    searchTerm, setSearchTerm, selectedClass, setSelectedClass,
    selectedGenre, setSelectedGenre, availableClasses, availableGenres,
    filteredTopics, handleOpenQuizModal, handleCloseQuizModal,
    handleStartQuizWithSettings, handleStudyFlashcards, handleOpenPdfModal, handleClosePdfModal,
    createSessionMutation, handleStartTheoryPaper
  } = useSubjectTopics();

  const { getColor } = useSubjectColors();
  const accentColor = getColor(subjectKey);

  const subjectDisplayName = currentSubject?.name || (subjectKey ? subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1) : '');

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (isLoading) {
    return <TopicSkeletonGrid />;
  }

  return (
    <Box sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 }, width: '100%' }}>
      <SubjectBreadcrumb subjectDisplayName={subjectDisplayName} accentColor={accentColor} />
      
      <TopicFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        availableClasses={availableClasses}
        availableGenres={availableGenres}
      />

      <Grid container justifyContent="flex-start">
        {filteredTopics.map((topic) => (
          <Grid item key={topic.id} sx={{
            display: 'flex',
            width: { xs: '100%', sm: '49.5%', md: '24.5%', lg: '24.5%', xl: '24.5%' },
            mb: { xs: '0.5%', sm: '0.5%', md: '0.5%', lg: '0.5%', xl: '0.5%' }
          }}>
            <TopicCard
              topic={topic}
              accentColor={accentColor}
              onStartQuiz={() => handleOpenQuizModal(topic)}
              onStudyFlashcards={() => handleStudyFlashcards(topic)}
              onPrintQuestions={() => handleOpenPdfModal(topic)}
              onGeneratePdf={() => handleOpenPdfModal(topic)}
              onStartTheory={() => handleStartTheoryPaper(topic)}
            />
            <Grid sx={{ width: { xs: '0%', sm: '1%', md: '2%', lg: '2%', xl: '2%' } }}></Grid>
          </Grid>
        ))}
      </Grid>

      <QuizSettingsModal
        open={modalOpen}
        onClose={handleCloseQuizModal}
        onStartQuiz={handleStartQuizWithSettings}
        topic={selectedTopicForQuiz}
        accentColor={accentColor}
      />

      <QuestionsPdfModal
        open={pdfModalOpen}
        onClose={handleClosePdfModal}
        topic={selectedTopicForPdf}
        accentColor={accentColor}
      />
    </Box>
  );
};

export default SubjectTopicsPage;
