// src/components/dashboard/ExpandedCardPortal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface ExpandedCardPortalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ExpandedCardPortal({ open, onClose, children }: ExpandedCardPortalProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <Box
          onClick={onClose}
          sx={{
            position: 'fixed', inset: 0, zIndex: 2000,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            p: { xs: 1.5, sm: 3 },
            background: theme => alpha(theme.palette.background.default, 0.6),
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.22 }}
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 960 }}
          >
            <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>{children}</Paper>
          </motion.div>
        </Box>
      )}
    </AnimatePresence>,
    document.body
  );
}


