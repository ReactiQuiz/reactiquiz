// src/components/core/AppDrawer.js
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Typography, useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import SchoolIcon from '@mui/icons-material/School';
import PollIcon from '@mui/icons-material/Poll';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 250;

function AppDrawer({ open, onClose }) {
  const theme = useTheme();

  // --- START OF FIX: Use theme.palette for colors instead of the deleted object ---
  const drawerItems = [
    { text: 'Dashboard', icon: <DashboardIcon sx={{ color: theme.palette.grey[500] }} />, path: '/dashboard', color: theme.palette.text.secondary },
    { text: 'All Subjects', icon: <CategoryIcon sx={{ color: theme.palette.primary.main }} />, path: '/subjects', color: theme.palette.primary.main },
    //{ text: 'Homibhabha', icon: <SchoolIcon sx={{ color: theme.palette.secondary.main }} />, path: '/homibhabha', color: theme.palette.secondary.main },
    { text: 'Results', icon: <PollIcon sx={{ color: '#4DB6AC' }} />, path: '/results', color: '#4DB6AC' },
    { type: 'divider' },
    { text: 'AI Center', icon: <SmartToyIcon sx={{ color: '#00BFA5' }} />, path: '/ai-center', color: '#00BFA5' },
    { text: 'My Account', icon: <AccountCircleIcon sx={{ color: '#81C784' }} />, path: '/account', color: '#81C784' },
    { text: 'Settings', icon: <SettingsIcon sx={{ color: theme.palette.grey[500] }} />, path: '/settings', color: theme.palette.text.secondary },
    { text: 'About Us', icon: <InfoIcon sx={{ color: '#FFA000' }} />, path: '/about', color: '#FFA000' },
  ];
  // --- END OF FIX ---

  const drawerContent = (
    <Box
      sx={{ width: drawerWidth, height: '100%' }}
      role="presentation"
      onClick={onClose}
      onKeyDown={onClose}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          ReactiQuiz
        </Typography>
      </Box>
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
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default AppDrawer;