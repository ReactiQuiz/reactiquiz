// src/components/dashboard/ExpandedCardPortal.tsx
/**
 * Expanded Card Portal Component
 * 
 * Displays an expanded card in a portal overlay.
 */
import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Paper, Typography, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

interface ExpandedCardPortalProps {
  open: boolean;
  onClose: () => void;
  subjectName?: string;
  children?: React.ReactNode;
}

export default function ExpandedCardPortal({ open, onClose, subjectName, children }: ExpandedCardPortalProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <Box
          onClick={onClose}
          sx={{
            position: 'fixed', inset: 0, zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            p: { xs: 1.5, sm: 3 },
            background: theme => alpha(theme.palette.background.default, 0.7),
            backdropFilter: 'blur(6px)'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 700 }}
          >
            <Paper sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                  {subjectName ? `${subjectName} Performance Details` : 'Subject Details'}
                </Typography>
                <Button size="small" onClick={onClose} sx={{ minWidth: 'auto', p: 0.5 }}>
                  <CloseIcon />
                </Button>
              </Box>

              {children ? children : (
                <Box sx={{ py: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    View individual topic scores, time stats, and accuracy breakdowns for {subjectName}.
                  </Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Box>
      )}
    </AnimatePresence>,
    document.body
  );
}
