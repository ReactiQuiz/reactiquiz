// src/pages/GKPage.js
import {
  useState, useEffect, useMemo
} from 'react';
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert
} from '@mui/material';
import {
  useNavigate
} from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import {
  subjectAccentColors
} from '../theme';
import TopicCard from '../components/TopicCard';
import QuizSettingsModal from '../components/QuizSettingsModal';

function GKPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(''); // For GK, 'class' might represent 'level' or 'category'

  const [topics, setTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [fetchTopicsError, setFetchTopicsError] = useState('');

  const GK_ACCENT_COLOR = subjectAccentColors.gk;

  useEffect(() => {
    const fetchGKTopics = async () => {
      setIsLoadingTopics(true);
      setFetchTopicsError('');
      try {
        const response = await apiClient.get('/api/topics/gk');
        if (Array.isArray(response.data)) {
          setTopics(response.data);
        } else {
          console.error('Fetched GK topics is not an array:', response.data);
          setFetchTopicsError('Invalid topic data received for General Knowledge.');
          setTopics([]);
        }
      } catch (err) {
        console.error('Error fetching GK topics:', err);
        setFetchTopicsError(`Failed to load General Knowledge topics: ${err.response?.data?.message || err.message}`);
        setTopics([]);
      } finally {
        setIsLoadingTopics(false);
      }
    };
    fetchGKTopics();
  }, []);

  const handleOpenModal = (topic) => {
    setSelectedTopic(topic);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTopic(null);
  };

  const handleStartQuizWithSettings = (settings) => {
    if (selectedTopic) {
      console.log(`Starting GK quiz for ${selectedTopic.name} with settings:`, settings);
      navigate(`/quiz/${selectedTopic.id}`, { 
        state: {
          difficulty: settings.difficulty,
          numQuestions: settings.numQuestions,
          topicName: selectedTopic.name,
          accentColor: GK_ACCENT_COLOR,
          quizClass: selectedTopic.class, 
          subject: "gk",
        }
      });
    }
    handleCloseModal();
  };

  const availableClasses = useMemo(() => {
    const allClasses = topics.map(topic => topic.class).filter(Boolean);
    return [...new Set(allClasses)].sort();
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: GK_ACCENT_COLOR, textAlign: 'center', mb: 2 }}
      >
        General Knowledge Quiz Topics
      </Typography>
      <Typography paragraph sx={{textAlign: 'center', mb:3}}>
        Explore a variety of General Knowledge topics. Select one to start your quiz.
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
            <InputLabel id="class-select-label-gk">Filter by Level/Class</InputLabel>
            <Select
                labelId="class-select-label-gk"
                value={selectedClass}
                label="Filter by Level/Class"
                onChange={(e) => setSelectedClass(e.target.value)}
            >
                <MenuItem value="">
                <em>All Levels/Classes</em>
                </MenuItem>
                {availableClasses.map((cls) => (
                <MenuItem key={cls} value={cls}>
                    {cls} 
                </MenuItem>
                ))}
            </Select>
            </FormControl>
        )}
      </Box>

      {isLoadingTopics && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ my: 3 }}>
          <CircularProgress sx={{color: GK_ACCENT_COLOR}} />
          <Typography sx={{ml: 2}}>Loading GK Topics...</Typography>
        </Box>
      )}
      {fetchTopicsError && (
        <Alert severity="error" sx={{ my: 2 }}>{fetchTopicsError}</Alert>
      )}

      {!isLoadingTopics && !fetchTopicsError && (
        <Box>
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic) => (
              <Box key={topic.id} sx={{ mb: 2 }}>
                <TopicCard
                  topic={topic}
                  onStartQuiz={() => handleOpenModal(topic)}
                  accentColor={GK_ACCENT_COLOR}
                  subjectBasePath="gk"
                />
              </Box>
            ))
          ) : (
            <Typography sx={{ mt: 2, textAlign: 'center' }}>No topics found matching your criteria.</Typography>
          )}
        </Box>
      )}

      {selectedTopic && (
        <QuizSettingsModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleStartQuizWithSettings}
          topicName={selectedTopic.name}
          accentColor={GK_ACCENT_COLOR}
        />
      )}
    </Box>
  );
}

export default GKPage;