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

function AdminSidebar({ drawerWidth, open, toggleDrawer }) {
  const theme = useTheme();

  const drawerContent = (
    <div>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', opacity: open ? 1 : 0, transition: 'opacity 0.2s' }}>
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

  // --- START OF THE DEFINITIVE FIX ---
  // We remove the wrapping <Box> and apply its styles directly to the <Drawer>.
  // The Drawer component itself will now act as the flex item in the layout.
  return (
    <Drawer
      variant="permanent"
      open={open}
      component="nav" // Moved from the Box
      sx={{
        flexShrink: 0, // Moved from the Box
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        // The dynamic width transition styles now apply directly to the root element
        '& .MuiDrawer-paper': {
          position: 'relative',
          width: drawerWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
        // Styles for the collapsed state
        ...(!open && {
            '& .MuiDrawer-paper': {
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: `calc(${theme.spacing(7)} + 1px)`,
                [theme.breakpoints.up('sm')]: {
                    width: `calc(${theme.spacing(8)} + 1px)`,
                },
            },
        }),
      }}
    >
      {drawerContent}
    </Drawer>
  );
  // --- END OF THE DEFINITIVE FIX ---
}

export default AdminSidebar;