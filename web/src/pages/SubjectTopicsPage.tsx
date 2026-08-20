// src/pages/SubjectTopicsPage.tsx
/**
 * Subject Topics Page
 * 
 * This page displays all topics within a specific subject. It provides
 * filtering by class and genre, search functionality, and actions to
 * start quizzes or study flashcards for each topic.
 */
import React from 'react';
import { Box, Alert, Typography } from '@mui/material';
import { useSubjectTopics } from '../hooks/useSubjectTopics';
import { useSubjectColors } from '../contexts/SubjectColorsContext';
import TopicCard from '../components/topics/TopicCard';
import QuizSettingsModal from '../components/quiz/QuizSettingsModal';
import TopicSkeletonGrid from '../components/topics/TopicSkeletonGrid';
import TopicFilters from '../components/topics/TopicFilters';
import SubjectBreadcrumb from '../components/topics/SubjectBreadcrumb';

/**
 * Subject Topics Page Component
 * 
 * Displays topics for a specific subject with:
 * - Subject breadcrumb navigation
 * - Topic filters (search, class, genre)
 * - Responsive topic grid layout
 * - Topic cards with metadata and actions
 * - Quiz settings modal for quiz creation
 * - Loading skeleton states
 * - Error message display
 * - Start quiz functionality
 * - Study flashcards navigation
 * 
 * This page is accessible to both authenticated and guest users.
 * Quiz functionality requires authentication.
 * 
 * @returns {JSX.Element} Subject topics page with filtering and actions
 */
const SubjectTopicsPage: React.FC = () => {
  const {
    subjectKey, currentSubject, isLoading, error,
    modalOpen, selectedTopicForQuiz,
    searchTerm, setSearchTerm, selectedClass, setSelectedClass,
    selectedGenre, setSelectedGenre, availableClasses, availableGenres,
    filteredTopics, handleOpenQuizModal, handleCloseQuizModal,
    handleStartQuizWithSettings, handleStudyFlashcards
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
    <Box sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      <SubjectBreadcrumb subjectDisplayName={subjectDisplayName} accentColor={accentColor} />
      <Typography variant="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem' }, color: accentColor, mb: 3 }}>
        {subjectDisplayName} topics
      </Typography>

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

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
        {filteredTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            accentColor={accentColor}
            onStartQuiz={() => handleOpenQuizModal(topic)}
            onStudyFlashcards={() => handleStudyFlashcards(topic)}
          />
        ))}
      </Box>

      <QuizSettingsModal
        open={modalOpen}
        onClose={handleCloseQuizModal}
        onStartQuiz={handleStartQuizWithSettings}
        topic={selectedTopicForQuiz}
        accentColor={accentColor}
      />
    </Box>
  );
};

export default SubjectTopicsPage;
