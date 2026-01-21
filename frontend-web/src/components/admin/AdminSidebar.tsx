// src/components/admin/AdminSidebar.tsx
/**
 * Admin Sidebar Component
 * 
 * This component displays the admin panel sidebar navigation drawer.
 * It provides navigation links to different admin pages and supports
 * collapsible/expandable states.
 */
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

/**
 * Navigation Items
 * 
 * Array of navigation items for the admin sidebar.
 */
const navItems = [
    { text: 'General', path: '/admin/general', icon: <SettingsIcon /> },
    { text: 'Content', path: '/admin/content', icon: <FolderCopyIcon /> },
    { text: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
];

/**
 * Admin Sidebar Component
 * 
 * Displays a collapsible sidebar navigation drawer with:
 * - Admin Panel header with toggle button
 * - Navigation links (General, Content, Users)
 * - Active route highlighting
 * - Collapsible/expandable functionality
 * - Tooltips when collapsed
 * - Smooth transitions
 * 
 * This component is used in AdminLayout to provide navigation
 * for admin pages.
 * 
 * @param {Object} props - Component props
 * @param {number} props.drawerWidth - Width of the drawer when expanded
 * @param {boolean} props.open - Whether the drawer is expanded
 * @param {Function} props.toggleDrawer - Callback to toggle drawer state
 * @returns {JSX.Element} Admin sidebar navigation drawer
 */
function AdminSidebar({ drawerWidth, open, toggleDrawer }) {
  const theme = useTheme();

  const drawerContent = (
    <div>
      {/* --- START OF THE DEFINITIVE FIX --- */}
      <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          // Apply justifyContent conditionally
          justifyContent: open ? 'space-between' : 'center', 
        }}>
      {/* --- END OF THE DEFINITIVE FIX --- */}
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', opacity: open ? 1 : 0, transition: 'opacity 0.3s' }}>
          Admin Panel
        </Typography>
        <IconButton aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'} onClick={toggleDrawer}>
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
        width: open ? drawerWidth : `calc(${theme.spacing(7)} + 1px)`,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        flexShrink: 0,
        '& .MuiDrawer-paper': {
            width: open ? drawerWidth : `calc(${theme.spacing(7)} + 1px)`,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            position: 'relative',
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