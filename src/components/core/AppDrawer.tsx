// src/components/core/AppDrawer.tsx
import React from 'react';
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
import { alpha } from '@mui/material/styles'; 

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 250;

const AppDrawer: React.FC<AppDrawerProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.id === process.env.REACT_APP_ADMIN_USER_ID;

  const baseDrawerItems: Array<{
    text?: string;
    icon?: React.ReactNode;
    path?: string;
    type?: 'divider';
    color?: string;
  }> = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', color: '#7aa2f7' },
    { text: 'All Subjects', icon: <CategoryIcon />, path: '/subjects', color: '#7dcfff' },
    { text: 'Results', icon: <PollIcon />, path: '/results', color: '#a6e3a1' },
    { type: 'divider' },
    { text: 'AI Center', icon: <SmartToyIcon />, path: '/ai-center', color: '#f7768e' },
    { text: 'My Account', icon: <AccountCircleIcon />, path: '/account', color: '#bb9af7' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings', color: '#e0af68' },
    { text: 'About Us', icon: <InfoIcon />, path: '/about', color: '#f7c06a' },
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
      sx={{ width: drawerWidth, height: '100%',
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.background.default, 1)} 60%)` }}
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
                  borderRadius: 1,
                  '& .MuiListItemIcon-root': { color: alpha(item.color || theme.palette.text.secondary, 0.9) },
                  '& .MuiListItemText-primary': { color: alpha(item.color || theme.palette.text.primary, 0.95) },
                  '&:hover': {
                    backgroundColor: alpha(item.color || theme.palette.primary.main, 0.08),
                  },
                  '&.active': {
                    backgroundColor: alpha(item.color || theme.palette.primary.main, 0.15),
                    borderRight: `3px solid ${item.color || theme.palette.primary.main}`,
                    '& .MuiListItemIcon-root': {
                      color: item.color || theme.palette.primary.main
                    },
                    '& .MuiListItemText-primary': { fontWeight: 700 }
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
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.background.default, 1)} 60%)`,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AppDrawer;