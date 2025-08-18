// src/components/admin/AdminSidebar.js
import React from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, useTheme
} from '@mui/material';
import { NavLink } from 'react-router-dom'; // Use NavLink for active styling
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';

const navItems = [
    { text: 'General', path: '/admin/general', icon: <SettingsIcon /> },
    { text: 'Content', path: '/admin/content', icon: <FolderCopyIcon /> }, 
    { text: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
];

function AdminSidebar({ drawerWidth }) {
  const theme = useTheme();

  const drawerContent = (
    <div>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Admin Panel
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                '&.active': { // NavLink adds the 'active' class
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            position: 'relative' // Important for layout within flexbox
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default AdminSidebar;