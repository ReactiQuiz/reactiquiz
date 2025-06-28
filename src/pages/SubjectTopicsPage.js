// src/pages/SubjectTopicsPage.js
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Breadcrumbs, Link as MuiLink, Grid, InputAdornment } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';

import { useSubjectTopics } from '../hooks/useSubjectTopics'; // <-- Import the new hook
import TopicCard from '../components/topics/TopicCard';
import QuizSettingsModal from '../components/quiz/QuizSettingsModal';

function SubjectTopicsPage() {
  const theme = useTheme();

  // Get all state and logic from the custom hook
  const {
    subjectKey,
    currentSubject,
    topics,
    isLoading,
    error,
    modalOpen,
    selectedTopicForQuiz,
    searchTerm,
    setSearchTerm,
    selectedClass,
    setSelectedClass,
    selectedGenre,
    setSelectedGenre,
    availableClasses,
    availableGenres,
    filteredTopics,
    handleOpenQuizModal,
    handleCloseQuizModal,
    handleStartQuizWithSettings,
    handleStudyFlashcards
  } = useSubjectTopics();

  const accentColor = currentSubject?.accentColor || theme.palette.primary.main;
  const subjectDisplayName = currentSubject?.name || subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);

  // --- Render Logic ---

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading topics for {subjectKey}...</Typography>
      </Box>
    );
  }

  if (error || !currentSubject) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Alert severity="error">{error || `Subject "${subjectKey}" could not be found.`}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={RouterLink} underline="hover" color="inherit" to="/subjects">
          Subjects
        </MuiLink>
        <Typography color={accentColor} sx={{ fontWeight: 'medium' }}>{subjectDisplayName}</Typography>
      </Breadcrumbs>
      <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 2, sm: 3, md: 4 }, mt: { xs: 1, sm: 1 } }} alignItems="flex-end">
        <Grid item xs={12} md={4}> {/* Takes full width on xs, 1/3rd on md+ */}
          <TextField
            fullWidth // Makes TextField take full width of its Grid item
            label="Search Topics"
            variant="outlined"
            value={searchTerm}
            placeholder="Enter topic name or keyword..."
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        {availableClasses.length > 0 && (
          <Grid item xs={12} sm={6} md={4}> {/* Full width on xs, half on sm, 1/3rd on md+ */}
            <FormControl fullWidth variant="outlined">
              <InputLabel id="class-select-label-dynamic">Filter by Class/Level</InputLabel>
              <Select
                labelId="class-select-label-dynamic"
                value={selectedClass}
                label="Filter by Class/Level"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Levels</em>
                </MenuItem>
                {availableClasses.map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {cls.includes('th') || cls.includes('st') || cls.includes('nd') || cls.includes('rd') ? `Class ${cls}` : cls}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        {availableGenres.length > 0 && (
          <Grid item xs={12} sm={availableClasses.length > 0 ? 6 : 12} md={4}> {/* Responsive based on class filter visibility */}
            <FormControl fullWidth variant="outlined">
              <InputLabel id="genre-select-label-dynamic">Filter by Genre</InputLabel>
              <Select
                labelId="genre-select-label-dynamic"
                value={selectedGenre}
                label="Filter by Genre"
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Genres</em>
                </MenuItem>
                {availableGenres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      {!isLoading && topics.length > 0 && filteredTopics.length === 0 && (searchTerm || selectedClass || selectedGenre) && (
        <Alert severity="info" sx={{ my: 2 }}>No topics found for {subjectDisplayName} matching your current filters.</Alert>
      )}
      {!isLoading && topics.length === 0 && !error && (
        <Alert severity="info" sx={{ my: 2 }}>No topics are currently available for {subjectDisplayName}.</Alert>
      )}


      <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
        {filteredTopics.map((topic) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={topic.id} sx={{
            display: 'flex',
            width: {
              xs: '100%',
              sm: '50%',
              md: '37.5%',
              lg: '25%',
            },
          }}>
            <TopicCard
              topic={topic}
              onStartQuiz={() => handleOpenQuizModal(topic)}
              onStudyFlashcards={() => handleStudyFlashcards(topic)}
              accentColor={accentColor}
            />
          </Grid>
        ))}
      </Grid>

      {selectedTopicForQuiz && (
        <QuizSettingsModal
          open={modalOpen}
          onClose={handleCloseQuizModal}
          onSubmit={handleStartQuizWithSettings}
          topicName={selectedTopicForQuiz.name}
          accentColor={accentColor}
        />
      )}
    </Box>
  );
}

export default SubjectTopicsPage;