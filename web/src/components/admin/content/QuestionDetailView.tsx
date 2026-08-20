// src/components/admin/content/QuestionDetailView.tsx
/**
 * Question Detail View Component
 * 
 * This component displays a detailed view for managing questions
 * within a specific topic. It supports viewing, editing, adding,
 * and deleting questions with pagination.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Skeleton, TextField, IconButton, CircularProgress,
  TablePagination
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CodeIcon from '@mui/icons-material/Code';
import apiClient from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationsContext';
import BulkImportModal from './BulkImportModal';
import DirectEditModal from './DirectEditModal';

const safeJsonStringify = (obj) => {
    try {
        return JSON.stringify(obj, null, 2);
    } catch {
        return "[]";
    }
};

const safeParseAndStringifyOptions = (opts) => {
    if (typeof opts === 'object' && opts !== null) {
        return safeJsonStringify(opts);
    }
    try {
        const parsed = JSON.parse(opts || '[]');
        return safeJsonStringify(parsed);
    } catch {
        return safeJsonStringify([{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }]);
    }
};

function QuestionDetailView({ topic, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [directEditModalOpen, setDirectEditModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { addNotification } = useNotifications();
  
  const [newQuestion, setNewQuestion] = useState({
      id: `${topic.id}-q`, text: '', options: safeJsonStringify([{id:'a', text:''},{id:'b', text:''},{id:'c', text:''},{id:'d', text:''}]),
      correctOptionId: 'a', explanation: ''
  });

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/api/admin/questions-by-topic?topicId=${topic.id}&page=${page + 1}&limit=${rowsPerPage}`);
      const parsedQuestions = (response.data.questions || []).map(q => ({
          ...q,
          options: safeParseAndStringifyOptions(q.options)
      }));
      setQuestions(parsedQuestions);
      setTotalQuestions(response.data.total || 0);
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to fetch questions.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [topic.id, page, rowsPerPage, addNotification]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleInputChange = (e, id) => {
      setQuestions(prev => prev.map(q => q.id === id ? {...q, [e.target.name]: e.target.value} : q));
  };
  
  const handleNewQuestionChange = (e) => {
      setNewQuestion(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    let allValid = true;
    const payload = [];
    for (const q of questions) {
        try {
            const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
            payload.push({ ...q, topicId: topic.id, options });
        } catch {
            allValid = false;
            addNotification(`Invalid JSON in options for question ${q.id}`, 'error');
        }
    }

    if (!allValid || payload.length === 0) {
      setIsSaving(false);
      return;
    }

    try {
      await apiClient.post('/api/admin/questions/batch-import', payload);
      addNotification('All changes saved successfully!', 'success');
      setIsEditMode(false);
      fetchQuestions();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to save questions.', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddQuestion = async () => {
      setIsSaving(true);
      try {
          const options = JSON.parse(newQuestion.options);
          await apiClient.post('/api/admin/questions', { ...newQuestion, topicId: topic.id, options });
          addNotification('Question added!', 'success');
          setNewQuestion({ id: `${topic.id}-q`, text: '', options: safeJsonStringify([{id:'a', text:''},{id:'b', text:''},{id:'c', text:''},{id:'d', text:''}]), correctOptionId: 'a', explanation: '' });
          fetchQuestions();
      } catch(err) {
          addNotification(err.response?.data?.message || 'Invalid JSON in options', 'error');
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeleteQuestion = async (id) => {
      if(window.confirm('Are you sure you want to delete this question?')) {
          try {
              await apiClient.delete(`/api/admin/questions/${id}`);
              addNotification('Question deleted!', 'success');
              fetchQuestions();
          } catch (err) {
              addNotification(err.response?.data?.message || 'Failed to delete question', 'error');
          }
      }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to All Topics
      </Button>
      <Paper variant="outlined">
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Manage Questions for:</Typography>
            <Typography color="text.secondary">{topic.name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
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
            {isEditMode && <Button variant="contained" size="small" onClick={handleSaveChanges} disabled={isSaving} startIcon={isSaving ? <CircularProgress size={18} color="inherit"/> : <SaveIcon/>}>Save Changes</Button>}
            <Button variant={isEditMode ? 'outlined' : 'contained'} size="small" onClick={() => setIsEditMode(!isEditMode)}>
              {isEditMode ? 'Done' : 'Edit'}
            </Button>
          </Box>
        </Box>

        <BulkImportModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          entityType="questions"
          onImportSuccess={fetchQuestions}
        />

        <DirectEditModal
          open={directEditModalOpen}
          onClose={() => setDirectEditModalOpen(false)}
          entityType="questions"
          currentData={questions}
          onSaveSuccess={fetchQuestions}
        />

        <TableContainer>
          <Table size="small">
            <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Text</TableCell><TableCell>Options (JSON)</TableCell><TableCell>Correct</TableCell>{isEditMode && <TableCell>Actions</TableCell>}</TableRow></TableHead>
            <TableBody>
              {isLoading ? Array.from(new Array(rowsPerPage)).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton/></TableCell></TableRow>)
               : questions.map(q => (
                <TableRow key={q.id}>
                    <TableCell sx={{verticalAlign: 'top'}}>{q.id}</TableCell>
                    <TableCell sx={{verticalAlign: 'top', width: '35%'}}>{isEditMode ? <TextField multiline fullWidth name="text" value={q.text} onChange={e => handleInputChange(e, q.id)} /> : q.text}</TableCell>
                    <TableCell sx={{verticalAlign: 'top', width: '45%'}}>{isEditMode ? <TextField multiline fullWidth name="options" value={q.options} rows={4} onChange={e => handleInputChange(e, q.id)} /> : <Typography variant="caption" sx={{whiteSpace: 'pre-wrap'}}>{q.options}</Typography>}</TableCell>
                    <TableCell sx={{verticalAlign: 'top'}}>{isEditMode ? <TextField name="correctOptionId" value={q.correctOptionId} onChange={e => handleInputChange(e, q.id)} sx={{width: 60}}/> : q.correctOptionId}</TableCell>
                    {isEditMode && <TableCell sx={{verticalAlign: 'top'}}><IconButton color="error" size="small" onClick={() => handleDeleteQuestion(q.id)}><DeleteIcon/></IconButton></TableCell>}
                </TableRow>
               ))}
              {isEditMode && 
                <TableRow sx={{bgcolor: 'action.hover'}}>
                    <TableCell><TextField label="ID*" name="id" value={newQuestion.id} onChange={handleNewQuestionChange} /></TableCell>
                    <TableCell><TextField multiline fullWidth label="Text*" name="text" value={newQuestion.text} onChange={handleNewQuestionChange}/></TableCell>
                    <TableCell><TextField multiline fullWidth label="Options (JSON)*" name="options" value={newQuestion.options} rows={4} onChange={handleNewQuestionChange}/></TableCell>
                    <TableCell><TextField label="Correct*" name="correctOptionId" value={newQuestion.correctOptionId} onChange={handleNewQuestionChange} sx={{width: 80}}/></TableCell>
                    <TableCell><IconButton color="success" onClick={handleAddQuestion} disabled={isSaving}><AddCircleIcon/></IconButton></TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination 
            rowsPerPageOptions={[5, 10, 25]} component="div" count={totalQuestions} rowsPerPage={rowsPerPage} page={page}
            onPageChange={(e, newPage) => setPage(newPage)} onRowsPerPageChange={e => {setRowsPerPage(parseInt(e.target.value, 10)); setPage(0);}}
        />
      </Paper>
    </Box>
  );
}

export default QuestionDetailView;