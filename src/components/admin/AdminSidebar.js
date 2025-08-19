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

// Define the navigation items for the sidebar
const navItems = [
    { text: 'General', path: '/admin/general', icon: <SettingsIcon /> },
    { text: 'Content', path: '/admin/content', icon: <FolderCopyIcon /> },
    { text: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
];

function AdminSidebar({ drawerWidth, open, toggleDrawer }) {
  const theme = useTheme();

  // The content inside the drawer (header, links, etc.)
  const drawerContent = (
    <div>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', opacity: open ? 1 : 0, transition: 'opacity 0.3s' }}>
          Admin Panel
        </Typography>
        <IconButton onClick={toggleDrawer}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
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
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        // The root Drawer component itself animates its width
        width: open ? drawerWidth : `calc(${theme.spacing(7)} + 1px)`,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        flexShrink: 0,
        // The styles for the paper inside the Drawer
        '& .MuiDrawer-paper': {
            width: open ? drawerWidth : `calc(${theme.spacing(7)} + 1px)`,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            position: 'relative', // Keeps the drawer within the flexbox flow
            overflowX: 'hidden',
            boxSizing: 'border-box',
        },
      }}
    >
        {drawerContent}
    </Drawer>
  );
}

export default AdminSidebar;