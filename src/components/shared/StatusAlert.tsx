// src/components/shared/StatusAlert.js
import React from 'react';
import { Paper, Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

const alertConfig = {
  success: {
    Icon: CheckCircleOutlineIcon,
    color: 'success',
  },
  error: {
    Icon: ErrorOutlineIcon,
    color: 'error',
  },
  warning: {
    Icon: WarningAmberOutlinedIcon,
    color: 'warning',
  },
  info: {
    Icon: InfoOutlinedIcon,
    color: 'info',
  },
};

function StatusAlert({ severity = 'info', title, message, sx }) {
  const theme = useTheme();
  const config = alertConfig[severity] || alertConfig.info;
  const { Icon, color } = config;

  const alertColor = theme.palette[color]?.main || theme.palette.info.main;
  const alertBgColor = alpha(alertColor, 0.15);

  if (!message) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        borderLeft: `4px solid ${alertColor}`,
        backgroundColor: alertBgColor,
        borderRadius: 1,
        ...sx,
      }}
    >
      <Icon sx={{ color: alertColor, fontSize: '1.5rem', mr: 1.5, ml: 0.5 }} />
      <Box>
        {title && <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>{title}</Typography>}
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          {message}
        </Typography>
      </Box>
    </Paper>
  );
}

export default StatusAlert;