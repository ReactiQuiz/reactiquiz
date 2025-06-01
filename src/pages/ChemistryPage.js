// src/pages/ChemistryPage.js
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

function ChemistryPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const [topics, setTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [fetchTopicsError, setFetchTopicsError] = useState('');

  const CHEMISTRY_ACCENT_COLOR = subjectAccentColors.chemistry;

  useEffect(() => {
    const fetchChemistryTopics = async () => {
      setIsLoadingTopics(true);
      setFetchTopicsError('');
      try {
        const response = await apiClient.get('/api/topics/chemistry');
        if (Array.isArray(response.data)) {
          setTopics(response.data);
        } else {
          console.error('Fetched chemistry topics is not an array:', response.data);
          setFetchTopicsError('Invalid topic data received for Chemistry.');
          setTopics([]);
        }
      } catch (err) {
        console.error('Error fetching chemistry topics:', err);
        setFetchTopicsError(`Failed to load Chemistry topics: ${err.response?.data?.message || err.message}`);
        setTopics([]);
      } finally {
        setIsLoadingTopics(false);
      }
    };
    fetchChemistryTopics();
  }, []);

  const handleOpenQuizModal = (topic) => {
    setSelectedTopicForQuiz(topic);
    setModalOpen(true);
  };

  const handleCloseQuizModal = () => {
    setModalOpen(false);
    setSelectedTopicForQuiz(null);
  };

  const handleStartQuizWithSettings = (settings) => {
    if (selectedTopicForQuiz) {
      navigate(`/quiz/${selectedTopicForQuiz.id}`, {
        state: {
          difficulty: settings.difficulty,
          numQuestions: settings.numQuestions,
          topicName: selectedTopicForQuiz.name,
          accentColor: CHEMISTRY_ACCENT_COLOR,
          subject: "chemistry",
          quizClass: selectedTopicForQuiz.class,
        }
      });
    }
    handleCloseQuizModal();
  };

  const handleStudyFlashcards = (topic) => {
    navigate(`/flashcards/${topic.id}`, {
      state: {
        topicName: topic.name,
        accentColor: CHEMISTRY_ACCENT_COLOR,
        subject: "chemistry",
        quizClass: topic.class,
      }
    });
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
        (topic.description && topic.description.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    return currentTopics;
  }, [searchTerm, selectedClass, topics]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: CHEMISTRY_ACCENT_COLOR }}
      >
        Chemistry Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to start a quiz or study with flashcards.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Search Topics"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="class-select-label">Filter by Class</InputLabel>
          <Select
            labelId="class-select-label"
            value={selectedClass}
            label="Filter by Class"
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <MenuItem value="">
              <em>All Classes</em>
            </MenuItem>
            {availableClasses.map((cls) => (
              <MenuItem key={cls} value={cls}>
                Class {cls}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isLoadingTopics && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ my: 3 }}>
          <CircularProgress sx={{color: CHEMISTRY_ACCENT_COLOR}}/>
          <Typography sx={{ml: 2}}>Loading Chemistry Topics...</Typography>
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
                  onStartQuiz={() => handleOpenQuizModal(topic)}
                  onStudyFlashcards={() => handleStudyFlashcards(topic)}
                  accentColor={CHEMISTRY_ACCENT_COLOR}
                  subjectBasePath="chemistry"
                />
              </Box>
            ))
          ) : (
            <Typography sx={{ mt: 2 }}>No topics found matching your criteria.</Typography>
          )}
        </Box>
      )}

      {selectedTopicForQuiz && (
        <QuizSettingsModal
          open={modalOpen}
          onClose={handleCloseQuizModal}
          onSubmit={handleStartQuizWithSettings}
          topicName={selectedTopicForQuiz.name}
          accentColor={CHEMISTRY_ACCENT_COLOR}
        />
      )}
    </Box>
  );
}

export default ChemistryPage;