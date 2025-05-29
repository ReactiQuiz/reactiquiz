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

function MathematicsPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const [topics, setTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [fetchTopicsError, setFetchTopicsError] = useState('');

  const MATHEMATICS_ACCENT_COLOR = subjectAccentColors.mathematics;

  useEffect(() => {
    const fetchMathematicsTopics = async () => {
      setIsLoadingTopics(true);
      setFetchTopicsError('');
      try {
        const response = await apiClient.get('/api/topics/mathematics');
        if (Array.isArray(response.data)) {
          setTopics(response.data);
        } else {
          console.error('Fetched mathematics topics is not an array:', response.data);
          setFetchTopicsError('Invalid topic data received for Mathematics.');
          setTopics([]);
        }
      } catch (err) {
        console.error('Error fetching mathematics topics:', err);
        setFetchTopicsError(`Failed to load Mathematics topics: ${err.response?.data?.message || err.message}`);
        setTopics([]);
      } finally {
        setIsLoadingTopics(false);
      }
    };
    fetchMathematicsTopics();
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
      navigate(`/quiz/${selectedTopic.id}`, {
        state: {
          difficulty: settings.difficulty,
          numQuestions: settings.numQuestions,
          topicName: selectedTopic.name,
          accentColor: MATHEMATICS_ACCENT_COLOR,
          subject: "mathematics",
          quizClass: selectedTopic.class,
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
        sx={{ color: MATHEMATICS_ACCENT_COLOR }}
      >
        Mathematics Quiz Topics
      </Typography>
      <Typography paragraph>
        Select a topic below to customize and start your Mathematics quiz.
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
          <CircularProgress sx={{color: MATHEMATICS_ACCENT_COLOR}} />
          <Typography sx={{ml: 2}}>Loading Mathematics Topics...</Typography>
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
                  accentColor={MATHEMATICS_ACCENT_COLOR}
                  subjectBasePath="mathematics"
                />
              </Box>
            ))
          ) : (
            <Typography sx={{ mt: 2 }}>No topics found matching your criteria.</Typography>
          )}
        </Box>
      )}

      {selectedTopic && (
        <QuizSettingsModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleStartQuizWithSettings}
          topicName={selectedTopic.name}
          accentColor={MATHEMATICS_ACCENT_COLOR}
        />
      )}
    </Box>
  );
}

export default MathematicsPage;