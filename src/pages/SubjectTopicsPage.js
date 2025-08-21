// src/pages/SubjectTopicsPage.js
import { Box, Typography, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Alert, Grid, InputAdornment, Skeleton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
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
    createSessionMutation, handleStartTheoryPaper
  } = useSubjectTopics();

  const { getColor } = useSubjectColors();
  const accentColor = getColor(subjectKey);

  const subjectDisplayName = currentSubject?.name || (subjectKey ? subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1) : '');

  const TopicSkeletonGrid = () => (
    <Grid container justifyContent="flex-start"> {/* Use flex-start for consistency */}
      {Array.from(new Array(8)).map((_, index) => (
        <Grid item key={index} sx={{
          display: 'flex',
          width: { xs: '100%', sm: '49.5%', md: '24.5%', lg: '24.5%', xl: '24.5%' },
          mb: { xs: '0.5%', sm: '0.5%', md: '0.5%', lg: '0.5%', xl: '0.5%' }
        }}>
          <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2, width: '100%', m: '0 1%' }} />
          <Grid sx={{ width: { xs: '0%', sm: '1%', md: '2%', lg: '2%', xl: '2%' } }}></Grid>
        </Grid>
      ))}
    </Grid>
  );

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <RouterLink to="/subjects" style={{ textDecoration: 'none', color: 'inherit' }}>
          Subjects
        </RouterLink>
        <NavigateNextIcon fontSize="small" sx={{ mx: 0.5 }} />
        <Typography component="span" sx={{ color: accentColor, fontWeight: 'medium' }}>{subjectDisplayName}</Typography>
      </Typography>

      {/* Filters UI (Unchanged) */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              label="Search Topics"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
              }}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Class</InputLabel>
              <Select value={selectedClass} label="Filter by Class" onChange={(e) => setSelectedClass(e.target.value)}>
                <MenuItem value=""><em>All Classes</em></MenuItem>
                {availableClasses.map(cls => <MenuItem key={cls} value={cls}>{cls}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Genre</InputLabel>
              <Select value={selectedGenre} label="Filter by Genre" onChange={(e) => setSelectedGenre(e.target.value)}>
                <MenuItem value=""><em>All Genres</em></MenuItem>
                {availableGenres.map(genre => <MenuItem key={genre} value={genre}>{genre}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {isLoading ? (
        <TopicSkeletonGrid />
      ) : (
        <>
          {filteredTopics.length === 0 && (
            <Alert severity="info" sx={{ my: 2 }}>No topics found for {subjectDisplayName} matching your current filters.</Alert>
          )}
          {/* --- START OF FIX: Changed justifyContent to flex-start --- */}
          <Grid container justifyContent="flex-start">
            {/* --- END OF FIX --- */}
            {filteredTopics.map((topic) => (
              <Grid item key={topic.id} sx={{
                display: 'flex',
                width: { xs: '100%', sm: '50%', md: '25%', lg: '25%', xl: '25%' },
                mb: { xs: '0.5%', sm: '0.5%', md: '0.5%', lg: '0.5%', xl: '0.5%' }
              }}>
                <TopicCard
                  topic={topic}
                  onStartQuiz={() => handleOpenQuizModal(topic)}
                  onStartTheory={() => handleStartTheoryPaper(topic)}
                  onStudyFlashcards={() => handleStudyFlashcards(topic)}
                  onPrintQuestions={() => handleOpenPdfModal(topic)}
                  accentColor={accentColor}
                // --- END OF FIX ---
                />
                <Grid sx={{ width: { xs: '0%', sm: '1%', md: '2%', lg: '2%', xl: '2%' } }}></Grid>
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
    </Box >
  );
}

export default SubjectTopicsPage;