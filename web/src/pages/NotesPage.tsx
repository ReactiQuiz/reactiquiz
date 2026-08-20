// src/pages/NotesPage.tsx
/**
 * Student Notes Reader Page
 * 
 * Immersive study notes reader with:
 * - Dynamic Subject Accent Color inheritance
 * - LaTeX math formula rendering via KaTeX
 * - Interactive Mermaid diagrams & inline SVGs
 * - Floating sticky Table of Contents with scrollspy
 * - Reading controls: Font Size Zoom & Print / PDF Export
 * - Transition quick actions to Quiz and Flashcards
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Breadcrumbs, Link, Button,
  Chip, CircularProgress, Tooltip, IconButton, Grid, Divider,
  ButtonGroup, useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StyleIcon from '@mui/icons-material/Style';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShareIcon from '@mui/icons-material/Share';
import CheckIcon from '@mui/icons-material/Check';
import apiClient from '../api/axiosInstance';
import { TopicNote } from '../types';
import { useSubjectColors } from '../contexts/SubjectColorsContext';
import { useNotifications } from '../contexts/NotificationsContext';
import NoteRenderer from '../components/notes/NoteRenderer';
import TableOfContents from '../components/notes/TableOfContents';

const NotesPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { getColor } = useSubjectColors();
  const { addNotification } = useNotifications();

  const [note, setNote] = useState<TopicNote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xl'>('normal');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const fontSizeMultipliers = {
    normal: 1,
    large: 1.15,
    xl: 1.3,
  };

  useEffect(() => {
    let isMounted = true;
    const fetchNote = async () => {
      if (!topicId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<TopicNote>(`/api/notes/topic/${topicId}`);
        if (isMounted) {
          setNote(response.data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Study notes for this topic are currently being prepared.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNote();

    return () => {
      isMounted = false;
    };
  }, [topicId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    addNotification('Notes link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Derive dynamic theme color
  const subjectKey = note?.subjectKey || note?.subject_id || 'physics';
  const dynamicColor = getColor(subjectKey);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">Loading study notes...</Typography>
      </Box>
    );
  }

  if (error || !note) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
          Back to Topics
        </Button>
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <MenuBookIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Notes Coming Soon
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            {error || 'Notes for this chapter are currently in review and will be available shortly.'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => navigate(`/quiz/${topicId}`)}
            >
              Take Practice Quiz
            </Button>
            <Button
              variant="outlined"
              startIcon={<StyleIcon />}
              onClick={() => navigate(`/flashcards/${topicId}`)}
            >
              Study Flashcards
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4, minHeight: '100vh' }}>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body {
              background: #fff !important;
              color: #000 !important;
            }
            .no-print {
              display: none !important;
            }
            .print-full-width {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
            .katex-display {
              page-break-inside: avoid;
            }
            table {
              page-break-inside: avoid;
            }
            h1, h2, h3 {
              page-break-after: avoid;
            }
          }
        `}
      </style>

      <Container maxWidth="lg">
        {/* Top Breadcrumb & Controls Row */}
        <Box className="no-print" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">
              Dashboard
            </Link>
            <Link component={RouterLink} to={`/subjects/${note.subjectKey || note.subject_id}`} underline="hover" color="inherit">
              {note.subjectName || 'Subject'}
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 600 }}>
              {note.topicName} Notes
            </Typography>
          </Breadcrumbs>

          {/* Reading Controls Toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Font Size Adjuster */}
            <ButtonGroup size="small" variant="outlined" aria-label="Font size controls">
              <Tooltip title="Normal text">
                <Button
                  onClick={() => setFontSizeLevel('normal')}
                  variant={fontSizeLevel === 'normal' ? 'contained' : 'outlined'}
                  sx={{ px: 1, minWidth: 32, fontSize: '0.75rem', fontWeight: 600 }}
                >
                  A
                </Button>
              </Tooltip>
              <Tooltip title="Large text">
                <Button
                  onClick={() => setFontSizeLevel('large')}
                  variant={fontSizeLevel === 'large' ? 'contained' : 'outlined'}
                  sx={{ px: 1, minWidth: 32, fontSize: '0.875rem', fontWeight: 700 }}
                >
                  A+
                </Button>
              </Tooltip>
              <Tooltip title="Extra large text">
                <Button
                  onClick={() => setFontSizeLevel('xl')}
                  variant={fontSizeLevel === 'xl' ? 'contained' : 'outlined'}
                  sx={{ px: 1, minWidth: 32, fontSize: '1rem', fontWeight: 800 }}
                >
                  A++
                </Button>
              </Tooltip>
            </ButtonGroup>

            {/* Share / Copy Link */}
            <Tooltip title={copiedLink ? 'Link Copied!' : 'Share Notes'}>
              <IconButton size="small" onClick={handleShare} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
                {copiedLink ? <CheckIcon fontSize="small" sx={{ color: 'success.main' }} /> : <ShareIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* Print / Export to PDF */}
            <Tooltip title="Print / Save as PDF">
              <IconButton size="small" onClick={handlePrint} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
                <PrintIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Main Content Layout */}
        <Grid container spacing={3}>
          {/* Main Note Document */}
          <Grid item xs={12} md={8.5}>
            <Paper
              variant="outlined"
              className="print-full-width"
              sx={{
                p: { xs: 2.5, sm: 4, md: 5 },
                borderRadius: 3,
                bgcolor: 'background.paper',
                borderTop: `6px solid ${dynamicColor}`,
                position: 'relative',
              }}
            >
              {/* Note Header */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                  <Chip
                    label={note.subjectName || 'Subject'}
                    size="small"
                    sx={{
                      bgcolor: dynamicColor,
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                    }}
                  />
                  {note.topicClass && (
                    <Chip label={`Class ${note.topicClass}`} size="small" variant="outlined" />
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.8rem', ml: 'auto' }}>
                    <AccessTimeIcon sx={{ fontSize: '0.95rem' }} />
                    <Typography variant="caption">{note.readTimeMinutes || 5} min read</Typography>
                  </Box>
                </Box>

                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', sm: '2.25rem' }, letterSpacing: '-0.02em', my: 1.5 }}>
                  {note.title || note.topicName}
                </Typography>

                {note.summary && (
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', fontStyle: 'italic', mb: 2 }}>
                    {note.summary}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />
              </Box>

              {/* Note Body (Parsed Markdown with KaTeX & Mermaid) */}
              <NoteRenderer
                content={note.content}
                fontSizeMultiplier={fontSizeMultipliers[fontSizeLevel]}
              />

              {/* End of Notes Banner */}
              <Box className="no-print" sx={{ mt: 6, pt: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.04)' : 'rgba(2, 132, 199, 0.04)',
                    borderColor: dynamicColor,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Finished reading?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reinforce your retention with interactive flashcards or test yourself in a timed quiz.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
                    <Button
                      variant="outlined"
                      startIcon={<StyleIcon />}
                      onClick={() => navigate(`/flashcards/${topicId}`)}
                      sx={{ borderRadius: 2 }}
                    >
                      Flashcards
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => navigate(`/quiz/${topicId}`)}
                      sx={{
                        borderRadius: 2,
                        bgcolor: dynamicColor,
                        color: '#FFFFFF',
                        '&:hover': { bgcolor: dynamicColor, filter: 'brightness(0.9)' },
                      }}
                    >
                      Start Quiz
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </Paper>
          </Grid>

          {/* Sticky Table of Contents Sidebar */}
          <Grid item xs={12} md={3.5} className="no-print">
            <TableOfContents content={note.content} accentColor={dynamicColor} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default NotesPage;
