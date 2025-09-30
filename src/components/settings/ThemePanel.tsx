// src/components/settings/ThemePanel.js
import React from 'react';
import {
  Paper, Typography, Box, Divider, Switch, useTheme
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode icon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode icon
import { useThemeContext } from '../../contexts/ThemeContext';

function ThemePanel() {
  const theme = useTheme();
  const { themeMode, toggleTheme } = useThemeContext();
  const isDark = themeMode === 'dark';

  return (
    <Paper sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Theme</Typography>
        <Typography variant="body2" color="text.secondary">
          Customize the appearance of ReactiQuiz.
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography>Appearance</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Brightness7Icon sx={{ color: isDark ? 'text.secondary' : 'primary.main' }} />
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            color="primary"
          />
          <Brightness4Icon sx={{ color: isDark ? 'primary.main' : 'text.secondary' }} />
        </Box>
      </Box>
    </Paper>
  );
}

export default ThemePanel;