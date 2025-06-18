// src/pages/SubjectTopicsPage.js
import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Breadcrumbs, Link as MuiLink, Grid } from '@mui/material'; // Added Grid here
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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

  useEffect(() => {
    if (!subjectKey) {
      setError('Subject key is missing from URL.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

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

  const handleOpenQuizModal = (topic) => {
    setSelectedTopicForQuiz(topic);
    setModalOpen(true);
  };

  const handleCloseQuizModal = () => {
    setModalOpen(false);
    setSelectedTopicForQuiz(null);
  };

  const handleStartQuizWithSettings = (settings) => {
    if (selectedTopicForQuiz && currentSubject) {
      navigate(`/quiz/${selectedTopicForQuiz.id}`, {
        state: {
          difficulty: settings.difficulty,
          numQuestions: settings.numQuestions,
          topicName: selectedTopicForQuiz.name,
          accentColor: accentColor,
          subject: currentSubject.subjectKey,
          quizClass: selectedTopicForQuiz.class,
        }
      });
    }
    handleCloseQuizModal();
  };

  const handleStudyFlashcards = (topic) => {
    if (currentSubject) {
      navigate(`/flashcards/${topic.id}`, {
        state: {
          topicName: topic.name,
          accentColor: accentColor,
          subject: currentSubject.subjectKey,
          quizClass: topic.class,
        }
      });
    }
  };

  const availableClasses = useMemo(() => {
    const allClasses = topics.map(topic => topic.class).filter(Boolean);
    return [...new Set(allClasses)].sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [topics]);

  const filteredTopics = useMemo(() => {
    let currentTopics = topics;
    if (selectedClass) {
      currentTopics = currentTopics.filter(topic => topic.class === selectedClass);
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentTopics = currentTopics.filter(topic =>
        topic.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        (topic.description && topic.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (topic.genre && topic.genre.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    return currentTopics;
  }, [searchTerm, selectedClass, topics]);


  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress sx={{ color: accentColor }} />
        <Typography sx={{ ml: 2 }}>Loading {subjectKey} data...</Typography>
      </Box>
    );
  }

  if (error || !currentSubject) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">{error || `Could not load details for subject: ${subjectKey}`}</Alert>
        <Button variant="outlined" onClick={() => navigate('/subjects')} sx={{ mt: 2 }}>Back to Subjects</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}> {/* Adjusted padding */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={RouterLink} underline="hover" color="inherit" to="/subjects">
          Subjects
        </MuiLink>
        <Typography color={accentColor} sx={{ fontWeight: 'medium' }}>{subjectDisplayName}</Typography>
      </Breadcrumbs>

      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: accentColor, display: 'flex', alignItems: 'center', mb: 1 }}
      >
        {subjectDisplayName} Quiz Topics
      </Typography>
      <Typography paragraph sx={{ mb: 3 }}>
        Select a topic below to start a quiz or study with flashcards for {subjectDisplayName}.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Search Topics or Genres"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        {availableClasses.length > 0 && (
          <FormControl sx={{ minWidth: 150 }}>
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
        )}
      </Box>

      {!isLoading && topics.length === 0 && !error && (
        <Alert severity="info" sx={{ my: 2 }}>No topics found for {subjectDisplayName} with the current filters.</Alert>
      )}

      {/* Grid container for TopicCards */}
      <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center"> {/* Added justifyContent */}
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            // Applying responsive grid item props
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
              // subjectBasePath={`subjects/${subjectKey}`} // This prop might not be strictly needed if navigation is handled by buttons
              />
            </Grid>
          ))
        ) : (
          !isLoading && searchTerm && topics.length > 0 && <Grid item xs={12}><Typography sx={{ mt: 2, textAlign: 'center' }}>No topics found matching your search criteria.</Typography></Grid>
        )}
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