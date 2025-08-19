// src/components/admin/content/ManageQuestions.js
import React, { useState } from 'react';
import { Box } from '@mui/material';
import TopicSummaryList from './TopicSummaryList';
import QuestionDetailView from './QuestionDetailView';

function ManageQuestions() {
  const [selectedTopic, setSelectedTopic] = useState(null);

  if (selectedTopic) {
    return (
      <QuestionDetailView 
        topic={selectedTopic} 
        onBack={() => setSelectedTopic(null)} 
      />
    );
  }

  return (
    <TopicSummaryList onSelectTopic={setSelectedTopic} />
  );
}

export default ManageQuestions;