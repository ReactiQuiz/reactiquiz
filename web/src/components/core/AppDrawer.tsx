// src/components/core/AppDrawer.tsx
/**
 * App Drawer Component
 *
 * The side navigation drawer, matched from Dashboard.dc.html's mockup:
 * a user header block, dot-marker nav items, and a pinned logout + version
 * footer. Nav item accents now cycle through the Organic ramps instead of
 * a fixed neon palette (Tokyo-Night-style hex per item).
 */
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
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../../contexts/AuthContext';
import { alpha } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 260;

const AppDrawer: React.FC<AppDrawerProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && (currentUser.id === process.env.REACT_APP_ADMIN_USER_ID || currentUser.isAdmin);

  const baseDrawerItems: Array<{
    text?: string;
    icon?: React.ReactNode;
    path?: string;
    type?: 'divider';
  }> = [
    { text: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
    { text: 'All Subjects', icon: <CategoryIcon fontSize="small" />, path: '/subjects' },
    { text: 'Results', icon: <PollIcon fontSize="small" />, path: '/results' },
    { type: 'divider' },
    { text: 'My Account', icon: <AccountCircleIcon fontSize="small" />, path: '/account' },
    { text: 'Settings', icon: <SettingsIcon fontSize="small" />, path: '/settings' },
    { text: 'About Us', icon: <InfoIcon fontSize="small" />, path: '/about' },
  ];

  const drawerItems = [...baseDrawerItems];
  if (isAdmin) {
    drawerItems.splice(3, 0, {
      text: 'Admin Panel',
      icon: <AdminPanelSettingsIcon fontSize="small" color="primary" />,
      path: '/admin',
    });
  }

  const getInitial = (name?: string) => name ? name.charAt(0).toUpperCase() : '?';

  const userInfoCard = currentUser ? (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        pt: 3, pb: 2.5, px: 2.5, mb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{
        width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%', bgcolor: 'primary.dark', mb: 1.25,
      }}>
        <Typography variant="h5" sx={{ fontFamily: 'inherit', color: 'background.default', userSelect: 'none' }}>
          {getInitial(currentUser.name)}
        </Typography>
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {currentUser.name || currentUser.username}
      </Typography>

      {currentUser.email && (
        <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 190, wordBreak: 'break-all' }}>
          {currentUser.email}
        </Typography>
      )}

      {currentUser.class && (
        <Box sx={{ mt: 1, bgcolor: (t) => alpha(t.palette.primary.main, 0.14), px: 1.5, py: 0.4, borderRadius: 999 }}>
          <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 700 }}>
            Class {currentUser.class}
          </Typography>
        </Box>
      )}
    </Box>
  ) : (
    <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="h6" sx={{ fontFamily: 'inherit', fontWeight: 400 }}>ReactiQuiz</Typography>
    </Box>
  );

  const drawerFooter = (
    <Box sx={{ mt: 2, px: 2, mb: 1, textAlign: 'center' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
        ReactiQuiz v1.0.0
      </Typography>
    </Box>
  );

  const logoutButton = currentUser && (
    <Box sx={{ px: 2, mb: 1.5 }}>
      <ListItemButton
        onClick={() => {
          onClose();
          setTimeout(() => window.location.pathname !== '/login' && window.location.assign('/login'), 400);
        }}
        sx={{
          borderRadius: 999,
          justifyContent: 'flex-start',
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': { backgroundColor: (t) => alpha(t.palette.text.primary, 0.06) },
        }}
      >
        <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
        <ListItemText primary="Log out" />
      </ListItemButton>
    </Box>
  );

  const drawerContent = (
    <Box
      sx={{ width: drawerWidth, height: '100%', display: 'flex', flexDirection: 'column' }}
      role="presentation"
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest('.no-drawer-close')) return;
        onClose();
      }}
      onKeyDown={onClose}
    >
      <div className="no-drawer-close">{userInfoCard}</div>

      <List sx={{ px: 1.5 }}>
        {drawerItems.map((item, index) => {
          return item.type === 'divider' ? (
            <Divider key={`divider-${index}`} sx={{ my: 1 }} />
          ) : (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: 1.5,
                  py: 1,
                  px: 1.5,
                  '&.active': {
                    backgroundColor: theme.palette.mode === 'light' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(96, 165, 250, 0.12)',
                    color: theme.palette.primary.main,
                    '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                    '& .MuiListItemText-primary': { fontWeight: 600 },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box flex={1} />

      <div className="no-drawer-close">
        {logoutButton}
        {drawerFooter}
      </div>
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
          backgroundImage: 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AppDrawer;
