// src/components/admin/AdminSidebar.js
import React from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, useTheme, IconButton, Tooltip
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const navItems = [
    { text: 'General', path: '/admin/general', icon: <SettingsIcon /> },
    { text: 'Content', path: '/admin/content', icon: <FolderCopyIcon /> },
    { text: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
];

// --- START OF CHANGES: Added open and toggleDrawer props ---
function AdminSidebar({ drawerWidth, open, toggleDrawer }) {
  const theme = useTheme();

  const drawerContent = (
    <div>
      {/* --- START OF CHANGES: Header with Toggle Button --- */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', opacity: open ? 1 : 0, transition: 'opacity 0.2s' }}>
          Admin Panel
        </Typography>
        <IconButton onClick={toggleDrawer}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      {/* --- END OF CHANGES --- */}
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            {/* --- START OF CHANGES: Tooltip for collapsed state --- */}
            <Tooltip title={item.text} placement="right" disableHoverListener={open}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  '&.active': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </Tooltip>
            {/* --- END OF CHANGES --- */}
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        // --- START OF CHANGES: CSS Transitions for smooth collapse/expand ---
        '& .MuiDrawer-paper': {
          position: 'relative', // Keep it inside the flex layout
          width: drawerWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          ...(!open && {
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            width: `calc(${theme.spacing(7)} + 1px)`, // Icon size + border
            [theme.breakpoints.up('sm')]: {
              width: `calc(${theme.spacing(8)} + 1px)`,
            },
          }),
        },
        // --- END OF CHANGES ---
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default AdminSidebar;