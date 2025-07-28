// src/pages/SettingsPage.js
import React from 'react';
import { Box, Grid, List, ListItem, ListItemButton, ListItemText, Typography, useTheme } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette'; // Icon for Appearance
import ThemePanel from '../components/settings/ThemePanel';

// In the future, you can add more settings panels and corresponding sidebar items
const settingsPanels = [
  { id: 'theme', label: 'Appearance', icon: <PaletteIcon />, component: <ThemePanel /> },
  // { id: 'account', label: 'Account', icon: <AccountCircleIcon />, component: <AccountPanel /> },
];

function SettingsPage() {
  const theme = useTheme();
  // For now, we only have one panel, so it's always selected.
  // In the future, you would use useState here to manage the active panel.
  const activePanelId = 'theme';

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 }, maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Settings
      </Typography>
      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* === Left Column (Sidebar Navigation) === */}
        <Grid item xs={12} md={4} lg={3}>
          <Typography variant="h6" sx={{ px: 2, pb: 1, fontWeight: 600 }}>
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
}

export default SettingsPage;