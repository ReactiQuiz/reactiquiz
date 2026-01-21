// src/components/shared/StatusAlert.tsx
/**
 * Status Alert Component
 * 
 * This component displays a status alert with an icon, title, and message.
 * It supports different severity levels (success, error, warning, info)
 * with appropriate colors and icons for each.
 */
import React from 'react';
import { Paper, Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

/**
 * Alert Configuration
 * 
 * Configuration object mapping severity levels to their
 * corresponding icons and theme colors.
 */
const alertConfig = {
  success: {
    Icon: CheckCircleOutlineIcon, // Green checkmark icon
    color: 'success', // Success color from theme
  },
  error: {
    Icon: ErrorOutlineIcon, // Red error icon
    color: 'error', // Error color from theme
  },
  warning: {
    Icon: WarningAmberOutlinedIcon, // Orange warning icon
    color: 'warning', // Warning color from theme
  },
  info: {
    Icon: InfoOutlinedIcon, // Blue info icon
    color: 'info', // Info color from theme
  },
};

/**
 * Status Alert Component
 * 
 * Displays a status alert with:
 * - Icon based on severity level
 * - Optional title text
 * - Message text
 * - Color-coded background and border based on severity
 * 
 * This component is used throughout the application to display
 * status messages, notifications, and feedback to users.
 * 
 * @param {Object} props - Component props
 * @param {'success' | 'error' | 'warning' | 'info'} [props.severity='info'] - Severity level
 * @param {string} [props.title] - Optional title text
 * @param {string} props.message - Message text to display
 * @param {Object} [props.sx] - Additional Material-UI sx styles
 * @returns {JSX.Element | null} Status alert component or null if no message
 */
function StatusAlert({ severity = 'info', title, message, sx }) {
  // Get theme for colors
  const theme = useTheme();
  // Get configuration for the specified severity (fallback to info)
  const config = alertConfig[severity] || alertConfig.info;
  const { Icon, color } = config;

  // Get alert color from theme (fallback to info if not found)
  const alertColor = theme.palette[color]?.main || theme.palette.info.main;
  // Create semi-transparent background color
  const alertBgColor = alpha(alertColor, 0.15);

  // Don't render if no message provided
  if (!message) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5, // Padding
        display: 'flex',
        alignItems: 'center',
        borderLeft: `4px solid ${alertColor}`, // Left border with severity color
        backgroundColor: alertBgColor, // Semi-transparent background
        borderRadius: 1,
        ...sx, // Merge with additional styles
      }}
    >
      {/* Icon - Color-coded based on severity */}
      <Icon sx={{ color: alertColor, fontSize: '1.5rem', mr: 1.5, ml: 0.5 }} />
      
      {/* Content Box */}
      <Box>
        {/* Optional Title */}
        {title && (
          <Typography 
            variant="subtitle2" 
            sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
          >
            {title}
          </Typography>
        )}
        
        {/* Message */}
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          {message}
        </Typography>
      </Box>
    </Paper>
  );
}

export default StatusAlert;