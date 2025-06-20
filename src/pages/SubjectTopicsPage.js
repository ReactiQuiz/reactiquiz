// src/pages/SubjectTopicsPage.js
import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Breadcrumbs, Link as MuiLink, Grid, InputAdornment } from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search'; // For search bar

import apiClient from '../api/axiosInstance';
import TopicCard from '../components/TopicCard';
import QuizSettingsModal from '../components/QuizSettingsModal';

function SubjectTopicsPage() {
  const { subjectKey } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [currentSubject, setCurrentSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(''); // New state for genre filter

  useEffect(() => {
    // ... (fetchSubjectDetailsAndTopics remains the same)
    if (!subjectKey) {
      setError('Subject key is missing from URL.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    // Reset filters when subject changes
    setSearchTerm('');
    setSelectedClass('');
    setSelectedGenre('');

    const fetchSubjectDetailsAndTopics = async () => {
      try {
        const subjectsResponse = await apiClient.get('/api/subjects');
        if (!Array.isArray(subjectsResponse.data)) {
          throw new Error('Invalid subjects data format received.');
        }
        const foundSubject = subjectsResponse.data.find(s => s.subjectKey.toLowerCase() === subjectKey.toLowerCase());

        if (!foundSubject) {
          throw new Error(`Subject '${subjectKey}' not found.`);
        }
        setCurrentSubject(foundSubject);

        const topicsResponse = await apiClient.get(`/api/topics/${foundSubject.subjectKey}`);
        if (Array.isArray(topicsResponse.data)) {
          setTopics(topicsResponse.data);
        } else {
          console.error(`Fetched topics for ${foundSubject.name} is not an array:`, topicsResponse.data);
          setTopics([]);
          setError(`Invalid topic data received for ${foundSubject.name}.`);
        }
      } catch (err) {
        console.error(`Error fetching data for subject ${subjectKey}:`, err);
        setError(`Failed to load data for ${subjectKey}: ${err.message}`);
        setCurrentSubject(null);
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectDetailsAndTopics();
  }, [subjectKey]);

  const accentColor = currentSubject?.accentColor || theme.palette.primary.main;
  const subjectDisplayName = currentSubject?.name || subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);

  const handleOpenQuizModal = (topic) => {/* ... */ setSelectedTopicForQuiz(topic); setModalOpen(true); };
  const handleCloseQuizModal = () => {/* ... */ setModalOpen(false); setSelectedTopicForQuiz(null); };
  const handleStartQuizWithSettings = (settings) => {/* ... */ if (selectedTopicForQuiz && currentSubject) { navigate(`/quiz/${selectedTopicForQuiz.id}`, { state: { difficulty: settings.difficulty, numQuestions: settings.numQuestions, topicName: selectedTopicForQuiz.name, accentColor: accentColor, subject: currentSubject.subjectKey, quizClass: selectedTopicForQuiz.class, } }); } handleCloseQuizModal(); };
  const handleStudyFlashcards = (topic) => {/* ... */ if (currentSubject) { navigate(`/flashcards/${topic.id}`, { state: { topicName: topic.name, accentColor: accentColor, subject: currentSubject.subjectKey, quizClass: topic.class, } }); } };

  const availableClasses = useMemo(() => { /* ... (remains the same) ... */ const allClasses = topics.map(topic => topic.class).filter(Boolean); return [...new Set(allClasses)].sort((a, b) => { const numA = parseInt(a); const numB = parseInt(b); if (!isNaN(numA) && !isNaN(numB)) return numA - numB; return a.localeCompare(b); }); }, [topics]);

  // New: Memoized list of available genres
  const availableGenres = useMemo(() => {
    const allGenres = topics.map(topic => topic.genre).filter(Boolean);
    return [...new Set(allGenres)].sort();
  }, [topics]);

  const filteredTopics = useMemo(() => {
    let currentTopics = topics;
    if (selectedClass) {
      currentTopics = currentTopics.filter(topic => topic.class === selectedClass);
    }
    if (selectedGenre) { // Filter by genre
      currentTopics = currentTopics.filter(topic => topic.genre === selectedGenre);
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentTopics = currentTopics.filter(topic =>
        topic.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        (topic.description && topic.description.toLowerCase().includes(lowerCaseSearchTerm))
        // Removed genre from search term as there's a dedicated filter now
      );
    }
    return currentTopics;
  }, [searchTerm, selectedClass, selectedGenre, topics]);


  if (isLoading) {/* ... */ }
  if (error || !currentSubject) {/* ... */ }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={RouterLink} underline="hover" color="inherit" to="/subjects">
          Subjects
        </MuiLink>
        <Typography color={accentColor} sx={{ fontWeight: 'medium' }}>{subjectDisplayName}</Typography>
      </Breadcrumbs>

      {/* Titles and paragraph REMOVED */}
      {/*
      <Typography
        variant="h4"
        // ... (removed)
      >
        {subjectDisplayName} Quiz Topics
      </Typography>
      <Typography paragraph sx={{ mb: 3 }}>
        Select a topic below to start a quiz or study with flashcards for {subjectDisplayName}.
      </Typography>
      */}

      {/* Filter Controls Section - Using Grid for responsive layout */}
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