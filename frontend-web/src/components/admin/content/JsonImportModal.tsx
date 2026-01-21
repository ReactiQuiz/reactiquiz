// src/components/admin/content/JsonImportModal.tsx
/**
 * JSON Import Modal Component
 * 
 * This component displays a modal dialog for importing questions
 * from JSON. It validates the JSON input and sends it to the API
 * for batch import.
 */
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Typography, CircularProgress, Alert
} from '@mui/material';
import apiClient from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationsContext';

/**
 * JSON Import Modal Component
 * 
 * Displays a modal for importing questions from JSON with:
 * - JSON text area input
 * - JSON validation
 * - Array validation (must be array)
 * - Batch import API integration
 * - Loading state during import
 * - Error handling and display
 * - Success callback
 * - Question count display
 * 
 * This component is used in ManageQuestions to allow admins
 * to import questions in bulk from JSON.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onImportSuccess - Callback after successful import
 * @returns {JSX.Element} JSON import modal dialog
 */
function JsonImportModal({ open, onClose, onImportSuccess }) {
  const [jsonInput, setJsonInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');
  const { addNotification } = useNotifications();

  const handleImport = async () => {
    setError('');
    let questions;
    try {
      questions = JSON.parse(jsonInput);
      if (!Array.isArray(questions)) {
        throw new Error("JSON must be an array of question objects.");
      }
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`);
      return;
    }

    setIsImporting(true);
    try {
      const response = await apiClient.post('/api/admin/questions/batch-import', questions);
      addNotification(response.data.message, 'success');
      onImportSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during import.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Import Questions from JSON</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Paste a valid JSON array of question objects into the text area below. Each object must conform to the required question schema. Existing questions with the same ID will be replaced.
        </Typography>
        <TextField
          multiline
          fullWidth
          rows={15}
          variant="outlined"
          placeholder='[{"id": "...", "topicId": "...", ...}]'
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          sx={{ mt: 2 }}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={isImporting}
          startIcon={isImporting ? <CircularProgress size={20} /> : null}
        >
          {isImporting ? 'Importing...' : `Import ${JSON.parse(jsonInput || '[]').length} Questions`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default JsonImportModal;