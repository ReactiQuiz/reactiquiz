// src/components/admin/content/DirectEditModal.tsx
/**
 * Direct Edit Modal Component
 * 
 * Allows admins to directly inspect and modify raw JSON data for Subjects, Topics, or Questions.
 * Uses VirtualizedJsonEditor for smooth editing of massive datasets and chunked saving.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, CircularProgress, Alert, Box, LinearProgress
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import apiClient from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationsContext';
import VirtualizedJsonEditor, { VirtualizedJsonEditorRef } from './VirtualizedJsonEditor';

const BATCH_CHUNK_SIZE = 300;

interface DirectEditModalProps {
  open: boolean;
  onClose: () => void;
  entityType: 'subjects' | 'topics' | 'questions' | 'notes';
  currentData: any[];
  onSaveSuccess: () => void;
}

export default function DirectEditModal({ open, onClose, entityType, currentData, onSaveSuccess }: DirectEditModalProps) {
  const editorRef = useRef<VirtualizedJsonEditorRef>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState<{ current: number; total: number; percent: number } | null>(null);
  const [error, setError] = useState('');
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (open) {
      setError('');
      setSaveProgress(null);
      const formatted = JSON.stringify(currentData, null, 2);
      if (editorRef.current) {
        editorRef.current.setValue(formatted);
      }
    }
  }, [open, currentData]);

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.formatDocument();
    }
  };

  const handleSave = async () => {
    setError('');
    const rawContent = editorRef.current?.getValue() || '';

    if (!rawContent.trim()) {
      setError('Cannot save empty data.');
      return;
    }

    let parsed: any[];
    try {
      parsed = JSON.parse(rawContent);
      if (!Array.isArray(parsed)) {
        throw new Error("Data must be a JSON array of items.");
      }
    } catch (e: any) {
      setError(`Invalid JSON syntax: ${e.message}`);
      return;
    }

    const totalItems = parsed.length;
    setIsSaving(true);
    setSaveProgress({ current: 0, total: totalItems, percent: 0 });

    try {
      const endpoint = `/api/admin/${entityType}/batch-import`;

      for (let i = 0; i < totalItems; i += BATCH_CHUNK_SIZE) {
        const chunk = parsed.slice(i, i + BATCH_CHUNK_SIZE);
        await apiClient.post(endpoint, chunk);

        const currentCount = Math.min(i + chunk.length, totalItems);
        const percent = Math.round((currentCount / totalItems) * 100);
        setSaveProgress({ current: currentCount, total: totalItems, percent });

        await new Promise(resolve => setTimeout(resolve, 15));
      }

      addNotification(`Direct edit saved successfully for ${totalItems.toLocaleString()} ${entityType}!`, 'success');
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save direct edits.';
      setError(`Save error: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={isSaving ? undefined : onClose} 
      fullWidth 
      maxWidth="lg"
      PaperProps={{
        sx: { minHeight: '680px' }
      }}
    >
      <DialogTitle sx={{ textTransform: 'capitalize', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        Direct Raw Edit — {entityType}
        <Button size="small" startIcon={<AutoFixHighIcon />} onClick={handleFormat} disabled={isSaving}>
          Format JSON
        </Button>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Directly inspect and modify raw JSON. The virtualized editor ensures zero latency even with 500k+ lines.
        </Typography>

        <Box sx={{ mt: 1, minHeight: '400px' }}>
          <VirtualizedJsonEditor
            ref={editorRef}
            height="420px"
            initialValue={JSON.stringify(currentData, null, 2)}
          />
        </Box>

        {saveProgress && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Saving updates: {saveProgress.current.toLocaleString()} / {saveProgress.total.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {saveProgress.percent}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={saveProgress.percent} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {isSaving ? `Saving (${saveProgress?.percent || 0}%)...` : 'Save All Direct Edits'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
