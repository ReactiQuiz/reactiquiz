// src/components/admin/content/QuestionDetailView.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Skeleton, TextField, IconButton, Tooltip, CircularProgress,
  TablePagination, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationsContext';

// A helper to safely stringify JSON for the text fields
const safeJsonStringify = (obj) => {
    try {
        return JSON.stringify(obj, null, 2); // Pretty print
    } catch {
        return "[]";
    }
};

function QuestionDetailView({ topic, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Start with fewer rows for questions
  const { addNotification } = useNotifications();
  
  const [newQuestion, setNewQuestion] = useState({
      id: `${topic.id}-q`, text: '', options: safeJsonStringify([{id:'a', text:''},{id:'b', text:''},{id:'c', text:''},{id:'d', text:''}]),
      correctOptionId: 'a', explanation: '', difficulty: 15
  });

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/api/admin/questions-by-topic?topicId=${topic.id}&page=${page + 1}&limit=${rowsPerPage}`);
      const parsedQuestions = response.data.questions.map(q => ({
          ...q,
          options: safeJsonStringify(JSON.parse(q.options || '[]'))
      }));
      setQuestions(parsedQuestions);
      setTotalQuestions(response.data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch questions.');
    } finally {
      setIsLoading(false);
    }
  }, [topic.id, page, rowsPerPage]);

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
    let success = true;
    for (const q of questions) {
        try {
            const options = JSON.parse(q.options); // Validate JSON before sending
            await apiClient.put(`/api/admin/questions/${q.id}`, { ...q, options });
        } catch (err) {
            success = false;
            addNotification(`Failed to save Q:${q.id}: ${err.response?.data?.message || 'Invalid JSON in options'}`, 'error');
        }
    }
    if (success) addNotification('All changes saved successfully!', 'success');
    setIsSaving(false);
    if(success) setIsEditMode(false);
  };
  
  const handleAddQuestion = async () => {
      setIsSaving(true);
      try {
          const options = JSON.parse(newQuestion.options); // Validate JSON
          await apiClient.post('/api/admin/questions', { ...newQuestion, topicId: topic.id, options });
          addNotification('Question added!', 'success');
          setNewQuestion({ id: `${topic.id}-q`, text: '', options: safeJsonStringify([{id:'a', text:''},{id:'b', text:''},{id:'c', text:''},{id:'d', text:''}]), correctOptionId: 'a', explanation: '', difficulty: 15 });
          fetchQuestions(); // Refresh
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
              fetchQuestions(); // Refresh
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
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">Manage Questions for:</Typography>
            <Typography color="text.secondary">{topic.name}</Typography>
          </Box>
          <Box>
            {isEditMode && <Button variant="contained" onClick={handleSaveChanges} disabled={isSaving} startIcon={isSaving ? <CircularProgress size={20}/> : <SaveIcon/>} sx={{mr: 1}}>Save Changes</Button>}
            <Button variant={isEditMode ? 'outlined' : 'contained'} onClick={() => setIsEditMode(!isEditMode)}>
              {isEditMode ? 'Done' : 'Edit'}
            </Button>
          </Box>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Text</TableCell><TableCell>Options (JSON)</TableCell><TableCell>Correct</TableCell><TableCell>Difficulty</TableCell>{isEditMode && <TableCell>Actions</TableCell>}</TableRow></TableHead>
            <TableBody>
              {isLoading ? Array.from(new Array(rowsPerPage)).map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton/></TableCell></TableRow>)
               : questions.map(q => (
                <TableRow key={q.id}>
                    <TableCell sx={{verticalAlign: 'top'}}>{q.id}</TableCell>
                    <TableCell sx={{verticalAlign: 'top', width: '30%'}}>{isEditMode ? <TextField multiline fullWidth name="text" value={q.text} onChange={e => handleInputChange(e, q.id)} /> : q.text}</TableCell>
                    <TableCell sx={{verticalAlign: 'top', width: '40%'}}>{isEditMode ? <TextField multiline fullWidth name="options" value={q.options} rows={4} onChange={e => handleInputChange(e, q.id)} /> : <Typography variant="caption" sx={{whiteSpace: 'pre-wrap'}}>{q.options}</Typography>}</TableCell>
                    <TableCell sx={{verticalAlign: 'top'}}>{isEditMode ? <TextField name="correctOptionId" value={q.correctOptionId} onChange={e => handleInputChange(e, q.id)} sx={{width: 60}}/> : q.correctOptionId}</TableCell>
                    <TableCell sx={{verticalAlign: 'top'}}>{isEditMode ? <TextField name="difficulty" type="number" value={q.difficulty} onChange={e => handleInputChange(e, q.id)} sx={{width: 70}}/> : q.difficulty}</TableCell>
                    {isEditMode && <TableCell sx={{verticalAlign: 'top'}}><IconButton color="error" size="small" onClick={() => handleDeleteQuestion(q.id)}><DeleteIcon/></IconButton></TableCell>}
                </TableRow>
               ))}
              {isEditMode && 
                <TableRow sx={{bgcolor: 'action.hover'}}>
                    <TableCell><TextField label="ID*" name="id" value={newQuestion.id} onChange={handleNewQuestionChange} /></TableCell>
                    <TableCell><TextField multiline fullWidth label="Text*" name="text" value={newQuestion.text} onChange={handleNewQuestionChange}/></TableCell>
                    <TableCell><TextField multiline fullWidth label="Options (JSON)*" name="options" value={newQuestion.options} rows={4} onChange={handleNewQuestionChange}/></TableCell>
                    <TableCell><TextField label="Correct*" name="correctOptionId" value={newQuestion.correctOptionId} onChange={handleNewQuestionChange} sx={{width: 80}}/></TableCell>
                    <TableCell><TextField label="Difficulty*" name="difficulty" type="number" value={newQuestion.difficulty} onChange={handleNewQuestionChange} sx={{width: 90}}/></TableCell>
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