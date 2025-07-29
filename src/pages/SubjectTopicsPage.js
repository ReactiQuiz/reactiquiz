// src/pages/SubjectTopicsPage.js
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Alert, Grid, InputAdornment, Skeleton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNextIcon';
import SearchIcon from '@mui/icons-material/Search';
import { useSubjectTopics } from '../hooks/useSubjectTopics';
import { useSubjectColors } from '../contexts/SubjectColorsContext';
import TopicCard from '../components/topics/TopicCard';
import QuizSettingsModal from '../components/quiz/QuizSettingsModal';
import QuestionsPdfModal from '../components/quiz/QuestionsPdfModal';

function SubjectTopicsPage() {
  const {
    subjectKey, currentSubject, topics, isLoading, error,
    modalOpen, selectedTopicForQuiz, pdfModalOpen, selectedTopicForPdf,
    searchTerm, setSearchTerm, selectedClass, setSelectedClass,
    selectedGenre, setSelectedGenre, availableClasses, availableGenres,
    filteredTopics, handleOpenQuizModal, handleCloseQuizModal,
    handleStartQuizWithSettings, handleStudyFlashcards, handleOpenPdfModal, handleClosePdfModal,
    createSessionMutation
  } = useSubjectTopics();

  const { getColor } = useSubjectColors();
  const accentColor = getColor(subjectKey);
  const subjectDisplayName = currentSubject?.name || (subjectKey ? subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1) : '');

  // ... (Skeleton component is unchanged)

  if (error) {
    return ( <Box sx={{ p: 3, textAlign: 'center' }}><Alert severity="error">{error}</Alert></Box> );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        <RouterLink to="/subjects" style={{ textDecoration: 'none', color: 'inherit' }}>Subjects</RouterLink>
        <NavigateNextIcon fontSize="small" sx={{ verticalAlign: 'middle', mx: 0.5 }} />
        <Typography component="span" sx={{ color: accentColor, fontWeight: 'medium' }}>{subjectDisplayName}</Typography>
      </Typography>

      {/* Filters UI is unchanged */}
      
      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from(new Array(8)).map((_, index) => ( <Grid item key={index} xs={12} sm={6} md={4} lg={3}><Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} /></Grid> ))}
        </Grid>
      ) : (
        <>
          {filteredTopics.length === 0 && ( <Alert severity="info" sx={{ my: 2 }}>No topics found for {subjectDisplayName} matching your current filters.</Alert> )}
          <Grid container spacing={2}>
            {filteredTopics.map((topic) => (
              <Grid item key={topic.id} xs={12} sm={6} md={4} lg={3}>
                <TopicCard
                  topic={topic}
                  onStartQuiz={() => handleOpenQuizModal(topic)}
                  onStudyFlashcards={() => handleStudyFlashcards(topic)}
                  onPrintQuestions={() => handleOpenPdfModal(topic)}
                  accentColor={accentColor}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {selectedTopicForQuiz && (
        <QuizSettingsModal
          open={modalOpen}
          onClose={handleCloseQuizModal}
          onSubmit={handleStartQuizWithSettings}
          topicName={selectedTopicForQuiz.name}
          accentColor={accentColor}
          isSubmitting={createSessionMutation.isPending}
        />
      )}
      {selectedTopicForPdf && (
        <QuestionsPdfModal
          open={pdfModalOpen}
          onClose={handleClosePdfModal}
          topic={selectedTopicForPdf}
          accentColor={accentColor}
        />
      )}
    </Box>
  );
}

export default SubjectTopicsPage;