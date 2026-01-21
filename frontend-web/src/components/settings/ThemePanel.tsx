// src/components/settings/ThemePanel.tsx
/**
 * Theme Panel Component
 * 
 * This component displays a theme selection panel in the settings.
 * It allows users to switch between different theme modes (light, dark, neon)
 * with visual previews and descriptions.
 */
import React from 'react';
import {
  Paper, Typography, Box, Divider, useTheme, Grid, Card, CardActionArea, Radio
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useThemeContext, ThemeType } from '../../contexts/ThemeContext';

/**
 * Theme Panel Component
 * 
 * Displays a theme selection panel with:
 * - Theme options (Light, Dark, Neon Light)
 * - Visual previews with icons
 * - Descriptions for each theme
 * - Active theme highlighting
 * - Radio button selection
 * - Grid layout for theme cards
 * 
 * This component is used on the Settings page to allow users
 * to change the application theme.
 * 
 * @returns {JSX.Element} Theme selection panel
 */
function ThemePanel() {
  // Get theme for styling
  const theme = useTheme();
  // Get theme context for theme mode management
  const { themeMode, setTheme } = useThemeContext();

  /**
   * Theme Options
   * 
   * Available theme options with icons and descriptions.
   */
  const themeOptions: { id: ThemeType; name: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'light',
      name: 'Light',
      icon: <Brightness7Icon />,
      description: 'Clean, bright interface for daytime use'
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: <Brightness4Icon />,
      description: 'Dark interface that\'s easy on the eyes'
    },
    {
      id: 'neon',
      name: 'Neon Light',
      icon: <AutoAwesomeIcon />,
      description: 'Vibrant, colorful interface with neon accents'
    }
  ];

  return (
    <Paper sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Theme</Typography>
        <Typography variant="body2" color="text.secondary">
          Customize the appearance of ReactiQuiz.
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Select Theme</Typography>
        <Grid container spacing={2}>
          {themeOptions.map((option) => (
            <Grid item xs={12} sm={4} key={option.id}>
              <Card 
                sx={{ 
                  border: themeMode === option.id ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  transform: themeMode === option.id ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: themeMode === option.id ? `0 0 10px ${theme.palette.primary.main}30` : 'none'
                }}
              >
                <CardActionArea 
                  onClick={() => setTheme(option.id)}
                  sx={{ 
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: option.id === 'light' ? '#F6F7F9' : 
                                    option.id === 'dark' ? '#111111' : 
                                    '#171A36',
                    mb: 2,
                    color: option.id === 'light' ? '#0A0A0A' : '#FFFFFF'
                  }}>
                    {option.icon}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Radio 
                      checked={themeMode === option.id}
                      size="small"
                      sx={{ p: 0.5, mr: 1 }}
                    />
                    <Typography variant="subtitle1" fontWeight={600}>
                      {option.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {option.description}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
}

export default ThemePanel;