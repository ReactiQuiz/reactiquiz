// src/components/admin/content/BulkImportModal.tsx
/**
 * Bulk Import Modal Component
 * 
 * Provides a high-performance modal for importing Subjects, Topics, or Questions in bulk.
 * Integrates VirtualizedJsonEditor to handle 500,000+ lines of JSON without crashing or freezing.
 * Includes chunked background uploading with a real-time progress bar.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, CircularProgress, Alert, Box, LinearProgress, Stack
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import apiClient from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationsContext';
import VirtualizedJsonEditor, { VirtualizedJsonEditorRef } from './VirtualizedJsonEditor';

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  entityType: 'subjects' | 'topics' | 'questions' | 'notes';
  onImportSuccess: () => void;
}

const TEMPLATES: Record<'subjects' | 'topics' | 'questions' | 'notes', string> = {
  subjects: JSON.stringify([
    {
      name: "Computer Science",
      subjectKey: "computer-science",
      description: "Basics of computers and programming",
      displayOrder: 5,
      iconName: "ComputerIcon",
      accentColorDark: "#3B82F6",
      accentColorLight: "#DBEAFE"
    }
  ], null, 2),
  topics: JSON.stringify([
    {
      id: "cs-programming-basics",
      name: "Programming Fundamentals",
      description: "Variables, loops, and logic",
      class: "Class 9th",
      genre: "State Board",
      subject_id: "1"
    }
  ], null, 2),
  questions: JSON.stringify([
    {
      id: "cs-q1",
      topicId: "cs-programming-basics",
      text: "What is the output of 2 + 2 in JavaScript?",
      options: [
        { id: "a", text: "4" },
        { id: "b", text: "22" },
        { id: "c", text: "undefined" },
        { id: "d", text: "Error" }
      ],
      correctOptionId: "a",
      explanation: "2 + 2 evaluates to the numeric sum 4."
    }
  ], null, 2),
  notes: JSON.stringify([
    {
      topicId: "laws-of-motion-9th",
      title: "Laws of Motion Notes",
      summary: "Summary of Newton's laws and kinematics",
      readTimeMinutes: 5,
      content: "# Laws of Motion\n\nKey notes on laws of motion."
    }
  ], null, 2),
};

const BATCH_CHUNK_SIZE = 300; // Optimal batch size for LibSQL & Express HTTP payloads

export default function BulkImportModal({ open, onClose, entityType, onImportSuccess }: BulkImportModalProps) {
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

  const handleLoadTemplate = () => {
    if (editorRef.current) {
      editorRef.current.setValue(TEMPLATES[entityType]);
      setError('');
    }
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.clear();
      setError('');
      setImportProgress(null);
    }
  };

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
    // Reset file input value so re-selecting same file triggers change
    e.target.value = '';
  };

  const handleImport = async () => {
    setError('');
    const rawContent = editorRef.current?.getValue() || '';

    if (!rawContent.trim()) {
      setError('Please paste JSON data or upload a file first.');
      return;
    }

    let items: any[];
    try {
      items = JSON.parse(rawContent);
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Input must be a non-empty JSON array.');
      }
    } catch (e: any) {
      setError(`Invalid JSON format: ${e.message}`);
      return;
    }

    const totalItems = items.length;
    setIsImporting(true);
    setImportProgress({ current: 0, total: totalItems, percent: 0 });

    try {
      const endpoint = `/api/admin/${entityType}/batch-import`;

      // Upload in chunks to avoid HTTP timeouts, payload limits, and LibSQL transaction limits
      for (let i = 0; i < totalItems; i += BATCH_CHUNK_SIZE) {
        const chunk = items.slice(i, i + BATCH_CHUNK_SIZE);
        await apiClient.post(endpoint, chunk);

        const currentCount = Math.min(i + chunk.length, totalItems);
        const percent = Math.round((currentCount / totalItems) * 100);
        setImportProgress({ current: currentCount, total: totalItems, percent });

        // Yield execution to keep the UI smooth and responsive
        await new Promise(resolve => setTimeout(resolve, 15));
      }

      addNotification(`Successfully imported ${totalItems.toLocaleString()} ${entityType}!`, 'success');
      onImportSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || `Failed to import ${entityType}.`;
      setError(`Import halted: ${msg}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={isImporting ? undefined : onClose} 
      fullWidth 
      maxWidth="lg"
      PaperProps={{
        sx: { minHeight: '680px' }
      }}
    >
      <DialogTitle sx={{ textTransform: 'capitalize', fontWeight: 700, pb: 1 }}>
        Bulk Import {entityType}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Paste a JSON array or upload a file. The virtualized editor effortlessly handles massive files (500,000+ lines) with zero UI lag.
        </Typography>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
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

          <Button 
            variant="text" 
            size="small" 
            onClick={handleLoadTemplate}
            disabled={isImporting}
          >
            Load Example Template
          </Button>

          <Button 
            variant="text" 
            color="error" 
            size="small" 
            startIcon={<DeleteOutlineIcon />} 
            onClick={handleClear}
            disabled={isImporting}
          >
            Clear Editor
          </Button>
        </Stack>

        <Box sx={{ flexGrow: 1, mt: 1, minHeight: '380px' }}>
          <VirtualizedJsonEditor
            ref={editorRef}
            height="400px"
            placeholder={`[\n  {\n    "id": "...",\n    ...\n  }\n]`}
          />
        </Box>

        {importProgress && (
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Importing {entityType}... ({importProgress.current.toLocaleString()} / {importProgress.total.toLocaleString()})
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
      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={onClose} disabled={isImporting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={isImporting}
          startIcon={isImporting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {isImporting ? `Importing (${importProgress?.percent || 0}%)...` : `Import ${entityType}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
