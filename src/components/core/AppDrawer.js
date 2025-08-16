// src/components/core/AppDrawer.js
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Divider, Box, Typography, useTheme
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import PollIcon from '@mui/icons-material/Poll';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 
import { useAuth } from '../../contexts/AuthContext'; 

function AppDrawer({ open, onClose }) {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.id === process.env.REACT_APP_ADMIN_USER_ID;

  const baseDrawerItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'All Subjects', icon: <CategoryIcon />, path: '/subjects' },
    { text: 'Results', icon: <PollIcon />, path: '/results' },
    { type: 'divider' },
    { text: 'AI Center', icon: <SmartToyIcon />, path: '/ai-center' },
    { text: 'My Account', icon: <AccountCircleIcon />, path: '/account' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'About Us', icon: <InfoIcon />, path: '/about' },
  ];

  const drawerItems = [...baseDrawerItems];
  if (isAdmin) {
    drawerItems.splice(3, 0, { 
      text: 'Admin Panel',
      icon: <AdminPanelSettingsIcon color="primary" />,
      path: '/admin',
    });
  }

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
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  '&.active': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderRight: `3px solid ${theme.palette.primary.main}`,
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main
                    }
                  }
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
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

const drawerWidth = 250;
import { alpha } from '@mui/material/styles'; 

export default AppDrawer;