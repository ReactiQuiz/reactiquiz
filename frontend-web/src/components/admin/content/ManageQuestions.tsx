// src/components/admin/content/ManageQuestions.tsx
/**
 * Manage Questions Component
 * 
 * This component provides a two-view interface for managing questions.
 * It displays a topic summary list initially, then switches to question
 * detail view when a topic is selected.
 */
import React, { useState } from 'react';
import TopicSummaryList from './TopicSummaryList';
import QuestionDetailView from './QuestionDetailView';

/**
 * Manage Questions Component
 * 
 * Provides question management interface with:
 * - Topic summary list view (initial state)
 * - Question detail view (when topic selected)
 * - View switching based on selection
 * - Back navigation support
 * 
 * This component is used on the admin Content page to manage
 * questions organized by topic.
 * 
 * @returns {JSX.Element} Question management interface
 */
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