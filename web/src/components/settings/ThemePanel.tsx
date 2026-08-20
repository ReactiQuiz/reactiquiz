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
      name: 'Light Mode',
      icon: <Brightness7Icon />,
      description: 'Clean, neutral off-white & soft gray interface optimized for daytime study'
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      icon: <Brightness4Icon />,
      description: 'Deep neutral slate & charcoal interface designed to reduce eye strain'
    },
  ];

  return (
    <Paper sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Appearance</Typography>
        <Typography variant="body2" color="text.secondary">
          Customize the visual theme and contrast of ReactiQuiz.
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Theme Mode</Typography>
        <Grid container spacing={2.5}>
          {themeOptions.map((option) => (
            <Grid item xs={12} sm={6} key={option.id}>
              <Card 
                sx={{ 
                  border: themeMode === option.id ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  transition: 'all 0.15s ease-in-out',
                  boxShadow: themeMode === option.id ? `0 0 0 1px ${theme.palette.primary.main}` : 'none',
                  backgroundColor: option.id === 'light' ? '#FFFFFF' : '#1E293B'
                }}
              >
                <CardActionArea 
                  onClick={() => setTheme(option.id)}
                  sx={{ 
                    p: 2.5,
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
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: option.id === 'light' ? '#F1F5F9' : '#334155',
                    mb: 2,
                    color: option.id === 'light' ? '#0F172A' : '#F8FAFC'
                  }}>
                    {option.icon}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Radio 
                      checked={themeMode === option.id}
                      size="small"
                      sx={{ p: 0.5, mr: 1 }}
                    />
                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: option.id === 'light' ? '#0F172A' : '#F8FAFC' }}>
                      {option.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: option.id === 'light' ? '#64748B' : '#94A3B8' }} align="center">
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