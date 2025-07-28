// src/components/AppDrawer.js
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Typography, useTheme
} from '@mui/material';
import {
  Link as RouterLink
} from 'react-router-dom';
// Removed individual subject accent colors if not used elsewhere directly in this file
// import { subjectAccentColors } from '../theme';

// Icons that are still needed
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category'; // For All Subjects
import SchoolIcon from '@mui/icons-material/School';     // For Homibhabha
import PollIcon from '@mui/icons-material/Poll';         // For Results
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 250;

function AppDrawer({ open, onClose }) {
  const theme = useTheme();

  const drawerItems = [
    { text: 'Dashboard', icon: <DashboardIcon sx={{ color: theme.palette.dashboardAccent?.main || theme.palette.grey[500] }} />, path: '/dashboard', color: theme.palette.dashboardAccent?.main || theme.palette.grey[500] },
    { text: 'All Subjects', icon: <CategoryIcon sx={{ color: theme.palette.primary.main }} />, path: '/subjects', color: theme.palette.primary.main },
    { text: 'Homibhabha', icon: <SchoolIcon sx={{ color: theme.palette.secondary.main }} />, path: '/homibhabha', color: theme.palette.secondary.main }, // Kept as per previous discussion
    { text: 'Results', icon: <PollIcon sx={{ color: theme.palette.resultsAccent?.main || theme.palette.info.main }} />, path: '/results', color: theme.palette.resultsAccent?.main || theme.palette.info.main },
    { type: 'divider' },
    { text: 'AI Center', icon: <SmartToyIcon sx={{ color: theme.palette.aiCenterAccent?.main || theme.palette.info.main }} />, path: '/ai-center', color: theme.palette.aiCenterAccent?.main || theme.palette.info.main },
    { text: 'My Account', icon: <AccountCircleIcon sx={{ color: theme.palette.accountAccent?.main || theme.palette.success.main }} />, path: '/account', color: theme.palette.accountAccent?.main || theme.palette.success.main },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'About Us', icon: <InfoIcon sx={{ color: theme.palette.aboutAccent?.main || theme.palette.warning.main }} />, path: '/about', color: theme.palette.aboutAccent?.main || theme.palette.warning.main },
  ];

  const drawerContent = (
    <Box
      sx={{ width: drawerWidth, height: '100%' }}
      role="presentation"
      onClick={onClose}
      onKeyDown={onClose}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.palette.background.paper, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          ReactiQuiz
        </Typography>
      </Box>
      <Divider />
      <List>
        {drawerItems.map((item, index) => (
          item.type === 'divider' ?
            <Divider key={`divider-${index}`} sx={{ my: 1 }} /> :
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={RouterLink} to={item.path}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: item.color || theme.palette.text.primary }} />
              </ListItemButton>
            </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default AppDrawer;