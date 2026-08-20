// src/components/admin/content/JsonImportModal.tsx
/**
 * JSON Import Modal Component
 * 
 * Provides a virtualized JSON editor for importing questions in bulk without browser crashes.
 * Supports massive JSON payloads (500k+ lines) and background chunked uploading.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, CircularProgress, Alert, Box, LinearProgress, Stack
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import apiClient from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationsContext';
import VirtualizedJsonEditor, { VirtualizedJsonEditorRef } from './VirtualizedJsonEditor';

const BATCH_CHUNK_SIZE = 300;

interface JsonImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const JsonImportModal: React.FC<JsonImportModalProps> = ({ open, onClose, onImportSuccess }) => {
  const editorRef = useRef<VirtualizedJsonEditorRef>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number; percent: number } | null>(null);
  const [error, setError] = useState('');
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (open) {
      setError('');
      setImportProgress(null);
    }
  }, [open]);

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.formatDocument();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      if (editorRef.current) {
        editorRef.current.setValue(content);
      }
      setError('');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    setError('');
    const rawContent = editorRef.current?.getValue() || '';

    if (!rawContent.trim()) {
      setError('Please paste JSON questions array or upload a file.');
      return;
    }

    let questions: any[];
    try {
      questions = JSON.parse(rawContent);
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("JSON must be a non-empty array of question objects.");
      }
    } catch (e: any) {
      setError(`Invalid JSON syntax: ${e.message}`);
      return;
    }

    const totalQuestions = questions.length;
    setIsImporting(true);
    setImportProgress({ current: 0, total: totalQuestions, percent: 0 });

    try {
      // Chunked upload to prevent HTTP timeouts & LibSQL limits
      for (let i = 0; i < totalQuestions; i += BATCH_CHUNK_SIZE) {
        const chunk = questions.slice(i, i + BATCH_CHUNK_SIZE);
        await apiClient.post('/api/admin/questions/batch-import', chunk);

        const currentCount = Math.min(i + chunk.length, totalQuestions);
        const percent = Math.round((currentCount / totalQuestions) * 100);
        setImportProgress({ current: currentCount, total: totalQuestions, percent });

        await new Promise(resolve => setTimeout(resolve, 15));
      }

      addNotification(`Successfully imported ${totalQuestions.toLocaleString()} questions!`, 'success');
      onImportSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "An error occurred during import.";
      setError(`Import error: ${msg}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={isImporting ? undefined : onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ fontWeight: 700 }}>Import Questions from JSON</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Paste a JSON array of question objects. Powered by a virtualized code editor that smoothly supports 500,000+ lines.
        </Typography>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
            size="small"
            disabled={isImporting}
          >
            Upload JSON File
            <input type="file" accept=".json,application/json" hidden onChange={handleFileUpload} />
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoFixHighIcon />}
            onClick={handleFormat}
            disabled={isImporting}
          >
            Format JSON
          </Button>
        </Stack>

        <Box sx={{ mt: 1, minHeight: '380px' }}>
          <VirtualizedJsonEditor
            ref={editorRef}
            height="400px"
            placeholder='[{"id": "...", "topicId": "...", ...}]'
          />
        </Box>

        {importProgress && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Importing questions: {importProgress.current.toLocaleString()} / {importProgress.total.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {importProgress.percent}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={importProgress.percent} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1.5 }}>
        <Button onClick={onClose} disabled={isImporting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={isImporting}
          startIcon={isImporting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {isImporting ? `Importing (${importProgress?.percent || 0}%)...` : 'Import Questions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JsonImportModal;