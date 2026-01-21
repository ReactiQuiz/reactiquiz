// src/components/dashboard/ExpandedCardPortal.tsx
/**
 * Expanded Card Portal Component
 * 
 * This component displays an expanded card in a portal overlay.
 * It renders content in a modal-like overlay with animations
 * and backdrop click to close.
 */
import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * ExpandedCardPortalProps Interface
 * 
 * Props for the ExpandedCardPortal component.
 */
interface ExpandedCardPortalProps {
  open: boolean; // Whether the portal is open
  onClose: () => void; // Callback to close the portal
  children: React.ReactNode; // Content to display in the portal
}

/**
 * Expanded Card Portal Component
 * 
 * Displays an expanded card in a portal overlay with:
 * - Portal rendering (renders to document.body)
 * - Framer Motion animations (fade, scale, slide)
 * - Backdrop with click to close
 * - Responsive layout
 * - AnimatePresence for exit animations
 * 
 * This component is used on dashboard pages to display
 * expanded card content in an overlay.
 * 
 * @param {ExpandedCardPortalProps} props - Component props
 * @returns {React.ReactPortal|null} Portal with expanded card or null
 */
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


