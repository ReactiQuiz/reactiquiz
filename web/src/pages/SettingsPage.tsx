// src/pages/SettingsPage.tsx
/**
 * Settings Page
 * 
 * This page provides access to application settings. Currently includes
 * theme/appearance settings, with extensibility for additional settings
 * panels in the future.
 */
import React from 'react';
import { Box, Grid, List, ListItem, ListItemButton, ListItemText, Typography, useTheme } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import ThemePanel from '../components/settings/ThemePanel';

/**
 * Settings Panels Configuration
 * 
 * Array of available settings panels. Each panel has an ID, label,
 * icon, and component. Currently includes only theme/appearance.
 * Additional panels can be added here in the future.
 */
const settingsPanels = [
  { id: 'theme', label: 'Appearance', icon: <PaletteIcon />, component: <ThemePanel /> },
  // { id: 'account', label: 'Account', icon: <AccountCircleIcon />, component: <AccountPanel /> },
];

/**
 * Settings Page Component
 * 
 * Displays the settings interface with:
 * - Settings sidebar navigation
 * - Active panel display area
 * - Theme/appearance settings panel
 * - Extensible structure for additional panels
 * - Responsive grid layout
 * - Selected state highlighting
 * 
 * This page is only accessible to authenticated users.
 * Currently supports theme selection, with infrastructure
 * for additional settings in the future.
 * 
 * @returns {JSX.Element} Settings page with panels
 */
const SettingsPage: React.FC = () => {
  const theme = useTheme();
  // For now, we only have one panel, so it's always selected.
  // In the future, you would use useState here to manage the active panel.
  const activePanelId = 'theme';

  return (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 }, maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem' }, mb: 4 }}>
        Settings
      </Typography>
      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* === Left Column (Sidebar Navigation) === */}
        <Grid item xs={12} md={4} lg={3}>
          <Typography variant="overline" sx={{ px: 2, pb: 1, display: 'block', color: 'text.secondary' }}>
            General
          </Typography>
          <List>
            {settingsPanels.map((panel) => (
              <ListItem key={panel.id} disablePadding>
                <ListItemButton
                  selected={activePanelId === panel.id}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.action.selected,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      }
                    }
                  }}
                >
                  {panel.icon && <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>{panel.icon}</Box>}
                  <ListItemText primary={panel.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* === Right Column (Content Area) === */}
        <Grid item xs={12} md={8} lg={9}>
          {settingsPanels.find(panel => panel.id === activePanelId)?.component}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;