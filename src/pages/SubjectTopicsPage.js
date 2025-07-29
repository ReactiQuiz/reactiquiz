// src/pages/SubjectTopicsPage.js
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Alert, Grid, InputAdornment, Skeleton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import { useSubjectTopics } from '../hooks/useSubjectTopics';
import { useSubjectColors } from '../contexts/SubjectColorsContext'; // Import the correct hook for colors
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
  
  // --- START OF FIX: Get color from the context ---
  const { getColor } = useSubjectColors();
  const accentColor = getColor(subjectKey);
  // --- END OF FIX ---
  
  const subjectDisplayName = currentSubject?.name || (subjectKey ? subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1) : '');

  const TopicSkeletonGrid = () => (
    <Grid container justifyContent="center">
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

      <Grid container sx={{ mb: { xs: 2, sm: 3, md: 4 }, mt: { xs: 1, sm: 1 } }} alignItems="flex-end">
        <Grid item sx={{
          width: { xs: '100%', sm: '100%', md: '50%', lg: '50%', xl: '50%' },
          mb: { xs: 2, sm: 2, md: 0 }
        }}>
          <TextField
            fullWidth
            label="Search Topics"
            variant="outlined"
            value={searchTerm}
            placeholder="Enter topic name or keyword..."
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: ( <InputAdornment position="start"><SearchIcon /></InputAdornment> ),
            }}
          />
        </Grid>
        {availableClasses.length > 0 && (
          <Grid item
            sx={{
              width: { xs: '100%', sm: '50%', md: '25%', lg: '25%', xl: '25%' },
              mb: { xs: 2, sm: 0 },
              pr: { sm: 1, md: 0 }
            }}
          >
            <FormControl fullWidth variant="outlined">
              <InputLabel id="class-select-label-dynamic">Filter by Class/Level</InputLabel>
              <Select
                labelId="class-select-label-dynamic"
                value={selectedClass}
                label="Filter by Class/Level"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <MenuItem value=""><em>All Levels</em></MenuItem>
                {availableClasses.map((cls) => (
                  <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        {availableGenres.length > 0 && (
          <Grid item sx={{ width: { xs: '100%', sm: '50%', md: '25%', lg: '25%', xl: '25%' } }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="genre-select-label-dynamic">Filter by Genre</InputLabel>
              <Select
                labelId="genre-select-label-dynamic"
                value={selectedGenre}
                label="Filter by Genre"
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <MenuItem value=""><em>All Genres</em></MenuItem>
                {availableGenres.map((genre) => (
                  <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      {isLoading ? (
        <TopicSkeletonGrid />
      ) : (
        <>
          {filteredTopics.length === 0 && (
            <Alert severity="info" sx={{ my: 2 }}>No topics found for {subjectDisplayName} matching your current filters.</Alert>
          )}
          <Grid container justifyContent="center">
            {filteredTopics.map((topic) => (
              <Grid item key={topic.id} sx={{
                display: 'flex',
                width: { xs: '100%', sm: '49.5%', md: '24.5%', lg: '24.5%', xl: '24.5%' },
                mb: { xs: '0.5%', sm: '0.5%', md: '0.5%', lg: '0.5%', xl: '0.5%' }
              }}>
                <TopicCard
                  topic={topic}
                  onStartQuiz={() => handleOpenQuizModal(topic)}
                  onStudyFlashcards={() => handleStudyFlashcards(topic)}
                  onPrintQuestions={() => handleOpenPdfModal(topic)}
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