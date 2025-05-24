// src/pages/chemistry/ChemistryPage.js
import React, { useState, useMemo } from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { chemistryTopics } from '../components/ChemistryTopics';
import TopicCard from '../components/TopicCard';
import QuizSettingsModal from '../components/QuizSettingsModal';
import { subjectAccentColors } from '../theme';

function ChemistryPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const CHEMISTRY_ACCENT_COLOR = subjectAccentColors.chemistry;

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
      console.log(`Starting Chemistry quiz for ${selectedTopic.name} with settings:`, settings);
      navigate(`/quiz/chemistry/${selectedTopic.id}`, {
        state: {
          difficulty: settings.difficulty,
          numQuestions: settings.numQuestions,
          topicName: selectedTopic.name,
          accentColor: CHEMISTRY_ACCENT_COLOR,
        }
      });
    }
    handleCloseModal();
  };

  const availableClasses = useMemo(() => {
    const allClasses = chemistryTopics.map(topic => topic.class).filter(Boolean);
    return [...new Set(allClasses)].sort();
  }, []);

  const filteredTopics = useMemo(() => {
    let topics = chemistryTopics;

    if (selectedClass) {
      topics = topics.filter(topic => topic.class === selectedClass);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      topics = topics.filter(topic =>
        topic.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        (topic.description && topic.description.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    return topics;
  }, [searchTerm, selectedClass]);

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
        Select a topic below to customize and start your Chemistry quiz.
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

      <Box>
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <Box key={topic.id} sx={{ mb: 2 }}>
              <TopicCard
                topic={topic}
                onStartQuiz={() => handleOpenModal(topic)}
                accentColor={CHEMISTRY_ACCENT_COLOR}
                subjectBasePath="chemistry"
              />
            </Box>
          ))
        ) : (
          <Typography sx={{mt: 2}}>No topics found matching your criteria.</Typography>
        )}
      </Box>

      {selectedTopic && (
        <QuizSettingsModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleStartQuizWithSettings}
          topicName={selectedTopic.name}
          accentColor={CHEMISTRY_ACCENT_COLOR}
        />
      )}
    </Box>
  );
}

export default ChemistryPage;