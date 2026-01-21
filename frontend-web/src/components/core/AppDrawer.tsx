// src/components/core/AppDrawer.tsx
/**
 * App Drawer Component
 * 
 * This component renders the side navigation drawer (sidebar) that slides
 * in from the left. It includes user information, navigation menu items,
 * and a logout button. The drawer shows different menu items based on
 * whether the user is an admin.
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
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 
import { useAuth } from '../../contexts/AuthContext'; 
import { alpha } from '@mui/material/styles'; 
import LogoutIcon from '@mui/icons-material/Logout';

/**
 * AppDrawerProps Interface
 * 
 * Props for the AppDrawer component.
 */
interface AppDrawerProps {
  open: boolean; // Whether the drawer is open
  onClose: () => void; // Callback to close the drawer
}

/**
 * Drawer Width
 * 
 * Width of the drawer in pixels.
 */
const drawerWidth = 250;

/**
 * App Drawer Component
 * 
 * Side navigation drawer that displays:
 * - User information card (name, email, class)
 * - Navigation menu items with icons and colors
 * - Admin panel link (for admin users only)
 * - Logout button (for authenticated users)
 * - App version and copyright footer
 * 
 * Menu items are styled with custom colors and highlight when active.
 * The drawer closes automatically when a menu item is clicked.
 * 
 * @param {AppDrawerProps} props - Component props
 * @returns {JSX.Element} Drawer component with navigation menu
 */
const AppDrawer: React.FC<AppDrawerProps> = ({ open, onClose }) => {
  // Get theme for styling
  const theme = useTheme();
  // Get current user from auth context
  const { currentUser } = useAuth();
  // Check if user is an admin (either by flag or ID match)
  const isAdmin = currentUser && (currentUser.id === process.env.REACT_APP_ADMIN_USER_ID || currentUser.isAdmin);

  /**
   * Base Drawer Items
   * 
   * Base navigation menu items available to all authenticated users.
   * Each item has a text label, icon, path, and custom color.
   * Dividers are used to group related items.
   */
  const baseDrawerItems: Array<{
    text?: string; // Menu item text
    icon?: React.ReactNode; // Menu item icon
    path?: string; // Route path
    type?: 'divider'; // Type for dividers
    color?: string; // Custom color for icon and active state
  }> = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', color: '#7aa2f7' }, // Dashboard - Blue
    { text: 'All Subjects', icon: <CategoryIcon />, path: '/subjects', color: '#7dcfff' }, // Subjects - Cyan
    { text: 'Results', icon: <PollIcon />, path: '/results', color: '#a6e3a1' }, // Results - Green
    { type: 'divider' }, // Divider separator
    { text: 'AI Center', icon: <SmartToyIcon />, path: '/ai-center', color: '#f7768e' }, // AI Center - Pink
    { text: 'My Account', icon: <AccountCircleIcon />, path: '/account', color: '#bb9af7' }, // Account - Purple
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings', color: '#e0af68' }, // Settings - Orange
    { text: 'About Us', icon: <InfoIcon />, path: '/about', color: '#f7c06a' }, // About - Yellow
  ];

  /**
   * Drawer Items
   * 
   * Complete list of drawer items, including admin panel link
   * if user is an admin. Admin panel is inserted after Results.
   */
  const drawerItems = [...baseDrawerItems];
  // Add admin panel link for admin users
  if (isAdmin) {
    drawerItems.splice(3, 0, { 
      text: 'Admin Panel',
      icon: <AdminPanelSettingsIcon color="primary" />,
      path: '/admin',
    });
  }

  /**
   * Get Initial
   * 
   * Extracts the first letter of a name and converts it to uppercase.
   * Returns '?' if name is not provided.
   * 
   * @param {string | undefined} name - User's name
   * @returns {string} First letter of name or '?'
   */
  const getInitial = (name?: string) => name ? name.charAt(0).toUpperCase() : '?';
  
  /**
   * User Info Card
   * 
   * Displays user information at the top of the drawer when user is logged in.
   * Shows user avatar (with initial), name, email, and class if available.
   * Shows app branding when user is not logged in.
   */
  const userInfoCard = currentUser ? (
    <Box
      sx={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        py: 2, 
        mb: 1,
        borderBottom: `1px solid ${theme.palette.divider}`, // Bottom border
        bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[50], // Background color
        borderRadius: '0 0 24px 24px', // Rounded bottom corners
        boxShadow: 0,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 0.5 }}>
        {/* User Avatar Circle */}
        <Box sx={{ position: 'relative', mb: 0.5 }}>
          <Box sx={{ 
            width: 62, 
            height: 62, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: '50%', // Circular avatar
            bgcolor: theme.palette.primary[theme.palette.mode === 'dark' ? 'dark' : 'light'], // Primary color background
            boxShadow: 2 // Shadow for depth
          }}>
            <Typography variant="h4" sx={{ color: theme.palette.primary.contrastText, userSelect: 'none' }}>
              {getInitial(currentUser.name)} {/* User's first initial */}
            </Typography>
          </Box>
        </Box>
        
        {/* User Name */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5, textAlign: 'center', color: theme.palette.text.primary }}>
          {currentUser.name || currentUser.username} {/* Display name or username */}
        </Typography>
        
        {/* User Email (if available) */}
        {currentUser.email && (
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, maxWidth: 180, textAlign: 'center', wordBreak: 'break-all' }}>
            {currentUser.email}
          </Typography>
        )}
        
        {/* User Class Badge (if available) */}
        {currentUser.class && (
          <Box sx={{ 
            mt: 0.8, 
            mb: 0.5, 
            bgcolor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#edf4fe', // Badge background
            px: 1.5, 
            py: 0.5, 
            borderRadius: 10, 
            display: 'inline-block' 
          }}>
            <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700, fontSize: '0.85rem' }}>
              Class {currentUser.class} {/* Display user's class */}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  ) : (
    // Show app branding when user is not logged in
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
        ReactiQuiz
      </Typography>
    </Box>
  );

  /**
   * Drawer Footer
   * 
   * Displays app version and creator information at the bottom of the drawer.
   */
  const drawerFooter = (
    <Box sx={{ mt: 2, px: 2, mb: 1, textAlign: 'center' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
        ReactiQuiz v1.0.0<br />by SanskarSontakke
      </Typography>
    </Box>
  );

  /**
   * Logout Button
   * 
   * Logout button displayed at the bottom of the drawer for authenticated users.
   * Closes the drawer and redirects to login page after a short delay.
   * Note: This is a UI trigger; actual logout logic is handled via NavBar/account menu.
   */
  const logoutButton = currentUser && (
    <Box sx={{ px: 2, mb: 2 }}>
      <ListItemButton
        onClick={() => {
          // Close drawer first
          onClose();
          // Wait for drawer close animation, then redirect to login
          setTimeout(() => window.location.pathname !== '/login' && window.location.assign('/login'), 400);
          // Note: This is just a UI trigger; actual logout logic is via NavBar/account
        }}
        sx={{
          mt: 2,
          bgcolor: theme.palette.error.main, // Error color (red) for logout
          color: theme.palette.error.contrastText, // Contrasting text color
          borderRadius: 2,
          '&:hover': {
            bgcolor: theme.palette.error.dark, // Darker red on hover
            color: '#fff',
            boxShadow: 1, // Add shadow on hover
          },
        }}
      >
        <LogoutIcon sx={{ mr: 1 }} />
        <ListItemText primary="Logout" />
      </ListItemButton>
    </Box>
  );

  /**
   * Drawer Content
   * 
   * Main content of the drawer, including:
   * - User info card (doesn't close drawer when clicked)
   * - Navigation menu items (close drawer when clicked)
   * - Logout button (doesn't close drawer when clicked)
   * - Footer (doesn't close drawer when clicked)
   * 
   * Elements with 'no-drawer-close' class prevent drawer from closing when clicked.
   */
  const drawerContent = (
    <Box
      sx={{ 
        width: drawerWidth, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        // Gradient background from paper to default color
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.background.default, 1)} 60%)` 
      }}
      role="presentation"
      // Don't close onClick for the user card, footer, or logout button
      onClick={(event) => {
        // Prevent drawer from closing when clicking the user card, logout, or app version
        const target = event.target as HTMLElement;
        if (target.closest('.no-drawer-close')) return;
        // Close drawer when clicking on menu items
        onClose();
      }}
      onKeyDown={onClose} // Close on Escape key
    >
      {/* User Info Card (wrapped in no-close div to prevent drawer close) */}
      <div className="no-drawer-close">{userInfoCard}</div>
      
      {/* Navigation Menu List */}
      <List>
        {drawerItems.map((item, index) => (
          item.type === 'divider' ?
            // Render divider if item type is 'divider'
            <Divider key={`divider-${index}`} sx={{ my: 1 }} /> :
            // Render menu item
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={NavLink} // Use NavLink for active state detection
                to={item.path}
                sx={{
                  borderRadius: 1,
                  py: 1.25,
                  mt: 0.5,
                  // Icon color with custom item color
                  '& .MuiListItemIcon-root': { color: alpha(item.color || theme.palette.text.secondary, 0.9) },
                  // Text color
                  '& .MuiListItemText-primary': { color: alpha(item.color || theme.palette.text.primary, 0.95) },
                  // Hover state with item color
                  '&:hover': { backgroundColor: alpha(item.color || theme.palette.primary.main, 0.12) },
                  // Active state (when on this route)
                  '&.active': {
                    backgroundColor: alpha(item.color || theme.palette.primary.main, 0.17), // Active background
                    borderRight: `3px solid ${item.color || theme.palette.primary.main}`, // Right border indicator
                    '& .MuiListItemIcon-root': { color: item.color || theme.palette.primary.main }, // Icon color
                    '& .MuiListItemText-primary': { fontWeight: 700 } // Bold text
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
        ))}
      </List>
      
      {/* Spacer to push footer to bottom */}
      <Box flex={1} />
      
      {/* Logout Button (wrapped in no-close div to prevent drawer close) */}
      <div className="no-drawer-close">{logoutButton}</div>
      
      {/* Footer */}
      {drawerFooter}
    </Box>
  );

  return (
    <Drawer
      anchor="left" // Drawer slides in from the left
      open={open} // Control drawer visibility
      onClose={onClose} // Close handler
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          // Gradient background matching content
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.background.default, 1)} 60%)`,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AppDrawer;