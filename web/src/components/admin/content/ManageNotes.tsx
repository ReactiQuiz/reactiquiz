// src/components/admin/content/ManageNotes.tsx
/**
 * Manage Notes Component (Admin Content Studio)
 * 
 * Split-Screen Studio Editor for authoring and managing chapter notes:
 * - Left Pane: Virtualized Monaco Editor for Markdown authoring with helper snippets
 *   (Headings, LaTeX math formulas, Mermaid flowcharts/mindmaps, Callouts, Tables)
 * - Right Pane: Real-Time Live Rendered Preview (Markdown + KaTeX + Mermaid + SVGs)
 * - Topic Selection Sidebar with status indicators (Has Note vs Missing Note)
 * - Batch Import & Direct Edit JSON support
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Chip,
  List, ListItem, ListItemButton, ListItemText, IconButton,
  Tooltip, CircularProgress, Stack, InputAdornment,
  useTheme
} from '@mui/material';
import Editor from '@monaco-editor/react';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FunctionsIcon from '@mui/icons-material/Functions';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import apiClient from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationsContext';
import { TopicNote, Topic } from '../../../types';
import NoteRenderer from '../../notes/NoteRenderer';
import BulkImportModal from './BulkImportModal';
import DirectEditModal from './DirectEditModal';

const SAMPLE_NOTE_TEMPLATE = `# Chapter Title

A concise summary of the key conceptual foundations for this chapter.

## Key Formulas & Laws

Newton's Universal Law of Gravitation:
$$F = G \\frac{m_1 m_2}{r^2}$$

Where:
- $G = 6.674 \\times 10^{-11} \\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$ (Universal Gravitational Constant)
- $m_1, m_2$ are the masses of the two interacting bodies
- $r$ is the distance between their centers of mass

## Conceptual Diagram

\`\`\`mermaid
graph TD
    A[Mass M1] <-->|Gravitational Force F| B[Mass M2]
    A --> C[Creates Gravitational Field]
    B --> C
    C --> D[Inverse Square Law: 1/r²]
\`\`\`

> [!NOTE]
> Gravitational force is always attractive and acts along the line joining the centers of mass.

> [!TIP]
> On Earth's surface, acceleration due to gravity is $g = \\frac{GM}{R^2} \\approx 9.8 \\text{ m/s}^2$.

## Summary Comparison Table

| Parameter | Mass ($m$) | Weight ($W$) |
| :--- | :--- | :--- |
| **Definition** | Quantity of matter contained in body | Force with which Earth attracts body ($W = mg$) |
| **SI Unit** | Kilogram (kg) | Newton (N) |
| **Nature** | Scalar (Constant everywhere) | Vector (Varies with local $g$) |
`;

export const ManageNotes: React.FC = () => {
  const theme = useTheme();
  const { addNotification } = useNotifications();
  const editorRef = useRef<any>(null);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [notes, setNotes] = useState<TopicNote[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [activeNote, setActiveNote] = useState<Partial<TopicNote>>({
    title: '',
    content: SAMPLE_NOTE_TEMPLATE,
    summary: '',
    readTimeMinutes: 5,
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [directEditModalOpen, setDirectEditModalOpen] = useState<boolean>(false);

  // Fetch all topics and notes
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [topicsRes, notesRes] = await Promise.all([
        apiClient.get<Topic[]>('/api/topics'),
        apiClient.get<TopicNote[]>('/api/admin/notes'),
      ]);

      const topicsList = topicsRes.data || [];
      const notesList = notesRes.data || [];
      setTopics(topicsList);
      setNotes(notesList);

      // Default to the first topic
      if (topicsList.length > 0 && !selectedTopicId) {
        const firstTopic = topicsList[0];
        setSelectedTopicId(firstTopic.id);
        const existingNote = notesList.find(n => n.topicId === firstTopic.id);
        if (existingNote) {
          setActiveNote(existingNote);
        } else {
          setActiveNote({
            topicId: firstTopic.id,
            title: `${firstTopic.name} Notes`,
            content: `# ${firstTopic.name}\n\nKey notes for ${firstTopic.name}.\n\n## Overview\n\nExplain core concepts here.\n`,
            summary: firstTopic.description || '',
            readTimeMinutes: 5,
          });
        }
      }
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Failed to fetch topics and notes', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, selectedTopicId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle selecting a topic from the sidebar
  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopicId(topic.id);
    const existing = notes.find(n => n.topicId === topic.id);
    if (existing) {
      setActiveNote(existing);
    } else {
      setActiveNote({
        topicId: topic.id,
        title: `${topic.name} Notes`,
        content: `# ${topic.name}\n\nKey conceptual notes for **${topic.name}**.\n\n## Overview\n\nStart writing notes, formulas, and diagrams here.\n`,
        summary: topic.description || '',
        readTimeMinutes: 5,
      });
    }
  };

  // Helper snippet inserter into Monaco Editor
  const insertSnippet = (snippet: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      editor.executeEdits('insert-snippet', [
        {
          range: selection,
          text: snippet,
          forceMoveMarkers: true,
        },
      ]);
      editor.focus();
    } else {
      setActiveNote(prev => ({
        ...prev,
        content: (prev.content || '') + '\n' + snippet,
      }));
    }
  };

  // Save / Update Note
  const handleSaveNote = async () => {
    if (!selectedTopicId) {
      addNotification('Please select a topic first.', 'error');
      return;
    }
    if (!activeNote.title?.trim()) {
      addNotification('Note title is required.', 'error');
      return;
    }
    if (!activeNote.content?.trim()) {
      addNotification('Note content is required.', 'error');
      return;
    }

    setIsSaving(true);
    const existingNote = notes.find(n => n.topicId === selectedTopicId);
    const noteId = existingNote?.id || `note-${selectedTopicId}`;

    const payload = {
      id: noteId,
      topicId: selectedTopicId,
      title: activeNote.title,
      content: activeNote.content,
      summary: activeNote.summary || '',
      readTimeMinutes: parseInt(String(activeNote.readTimeMinutes || 5), 10),
    };

    try {
      if (existingNote) {
        await apiClient.put(`/api/admin/notes/${existingNote.id}`, payload);
        addNotification('Note updated successfully!', 'success');
      } else {
        await apiClient.post('/api/admin/notes', payload);
        addNotification('Note created successfully!', 'success');
      }
      fetchData();
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Failed to save note.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async () => {
    const existingNote = notes.find(n => n.topicId === selectedTopicId);
    if (!existingNote) return;

    if (window.confirm(`Are you sure you want to delete the notes for '${existingNote.title || selectedTopicId}'?`)) {
      setIsSaving(true);
      try {
        await apiClient.delete(`/api/admin/notes/${existingNote.id}`);
        addNotification('Note deleted successfully.', 'success');
        fetchData();
      } catch (error: any) {
        addNotification(error.response?.data?.message || 'Failed to delete note.', 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Filter topics by search term
  const filteredTopics = topics.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.genre && t.genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedNoteExists = notes.some(n => n.topicId === selectedTopicId);

  return (
    <Box>
      {/* Top Action Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Topic Notes Studio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Author and preview rich 1–2 page study notes with LaTeX math, Mermaid diagrams, and callout boxes.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<UploadFileIcon />}
            onClick={() => setImportModalOpen(true)}
          >
            Bulk Import
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CodeIcon />}
            onClick={() => setDirectEditModalOpen(true)}
          >
            Direct Edit (JSON)
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Modals for Bulk Import and Direct Edit */}
      <BulkImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        entityType="notes"
        onImportSuccess={fetchData}
      />

      <DirectEditModal
        open={directEditModalOpen}
        onClose={() => setDirectEditModalOpen(false)}
        entityType="notes"
        currentData={notes}
        onSaveSuccess={fetchData}
      />

      {/* Main 3-Column Studio Grid */}
      <Grid container spacing={2}>
        {/* Left Column: Topic Selector List */}
        <Grid item xs={12} md={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              height: 'calc(100vh - 230px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <TextField
              size="small"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Topics ({filteredTopics.length})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notes.length} with notes
              </Typography>
            </Box>

            <List sx={{ flex: 1, overflowY: 'auto', p: 0 }} dense>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                filteredTopics.map((topic) => {
                  const isSelected = topic.id === selectedTopicId;
                  const hasNote = notes.some(n => n.topicId === topic.id);

                  return (
                    <ListItem key={topic.id} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => handleSelectTopic(topic)}
                        sx={{
                          borderRadius: 1.5,
                          py: 0.75,
                          transition: 'all 150ms ease',
                          '&.Mui-selected': {
                            bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.12)',
                            borderLeft: (t) => `3px solid ${t.palette.primary.main}`,
                          },
                        }}
                      >
                        <ListItemText
                          primary={topic.name}
                          secondary={topic.class ? `Class ${topic.class}` : topic.genre}
                          primaryTypographyProps={{
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 700 : 500,
                            noWrap: true,
                          }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                        <Chip
                          label={hasNote ? 'Ready' : 'Draft'}
                          size="small"
                          color={hasNote ? 'success' : 'default'}
                          variant={hasNote ? 'filled' : 'outlined'}
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, ml: 1 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })
              )}
            </List>
          </Paper>
        </Grid>

        {/* Center Column: Monaco Editor */}
        <Grid item xs={12} md={5}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              height: 'calc(100vh - 230px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Metadata inputs */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
              <TextField
                size="small"
                label="Note Title"
                value={activeNote.title || ''}
                onChange={(e) => setActiveNote(prev => ({ ...prev, title: e.target.value }))}
                fullWidth
              />
              <TextField
                size="small"
                label="Read (min)"
                type="number"
                value={activeNote.readTimeMinutes || 5}
                onChange={(e) => setActiveNote(prev => ({ ...prev, readTimeMinutes: parseInt(e.target.value, 10) || 5 }))}
                sx={{ width: 110 }}
              />
            </Stack>

            <TextField
              size="small"
              label="Short Summary"
              value={activeNote.summary || ''}
              onChange={(e) => setActiveNote(prev => ({ ...prev, summary: e.target.value }))}
              fullWidth
              sx={{ mb: 1.5 }}
            />

            {/* Quick Snippet Toolbar */}
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                p: 0.5,
                bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                borderRadius: 1.5,
                mb: 1,
                overflowX: 'auto',
              }}
            >
              <Tooltip title="Insert Math Equation ($$...$$)">
                <IconButton size="small" onClick={() => insertSnippet('$$\nF = G \\frac{m_1 m_2}{r^2}\n$$')}>
                  <FunctionsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Insert Mermaid Diagram Block">
                <IconButton size="small" onClick={() => insertSnippet('```mermaid\ngraph TD\n    A[Step 1] --> B[Step 2]\n    B --> C[Result]\n```')}>
                  <AccountTreeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Insert Callout Alert Box">
                <IconButton size="small" onClick={() => insertSnippet('> [!IMPORTANT]\n> Key conceptual point to remember for exams.')}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Insert Table Template">
                <IconButton size="small" onClick={() => insertSnippet('| Concept | Formula | Unit |\n| :--- | :--- | :--- |\n| Force | $F = ma$ | N |\n| Energy | $E = mc^2$ | J |')}>
                  <TableChartIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Monaco Editor Container */}
            <Box
              sx={{
                flex: 1,
                minHeight: 280,
                borderRadius: 1.5,
                overflow: 'hidden',
                border: (t) => `1px solid ${t.palette.divider}`,
              }}
            >
              <Editor
                height="100%"
                defaultLanguage="markdown"
                value={activeNote.content || ''}
                theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                onChange={(val) => setActiveNote(prev => ({ ...prev, content: val || '' }))}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                options={{
                  wordWrap: 'on',
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  padding: { top: 8, bottom: 8 },
                  renderLineHighlight: 'all',
                }}
              />
            </Box>

            {/* Bottom Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
              {selectedNoteExists ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteNote}
                  disabled={isSaving}
                >
                  Delete Note
                </Button>
              ) : <Box />}

              <Button
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={handleSaveNote}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : selectedNoteExists ? 'Update Note' : 'Create Note'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Live Rendered Preview */}
        <Grid item xs={12} md={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              height: 'calc(100vh - 230px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 1, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
              <VisibilityIcon fontSize="small" sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', fontSize: '0.75rem' }}>
                Live Rendered Preview
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <NoteRenderer content={activeNote.content || ''} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManageNotes;
