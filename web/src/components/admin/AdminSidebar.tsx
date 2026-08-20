// src/components/admin/AdminSidebar.tsx
/**
 * Admin Sidebar Component
 *
 * The persistent admin navigation, matched from AdminUsers.dc.html: a brand
 * link, an "Admin" section label, dot-marker nav items, and a pinned
 * "← Back to app" link. Collapsible behavior is kept as an enhancement
 * beyond the mockup (which assumes a fixed 220px rail).
 */
import React from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, useTheme, IconButton, Tooltip, Chip
} from '@mui/material';
import { NavLink, Link as RouterLink } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { alpha } from '@mui/material/styles';

const navItems = [
  { text: 'General Settings', path: '/admin/general', icon: <SettingsIcon /> },
  { text: 'Content Management', path: '/admin/content', icon: <FolderCopyIcon /> },
  { text: 'User Management', path: '/admin/users', icon: <PeopleIcon /> },
];

interface AdminSidebarProps {
  drawerWidth: number;
  open: boolean;
  toggleDrawer: () => void;
}

function AdminSidebar({ drawerWidth, open, toggleDrawer }: AdminSidebarProps) {
  const theme = useTheme();

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center' }}>
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography component={RouterLink} to="/dashboard" variant="h6" sx={{ fontWeight: 800, color: 'text.primary', textDecoration: 'none', letterSpacing: '-0.02em' }}>
              ReactiQuiz
            </Typography>
            <Chip label="HQ" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'primary.main', color: '#fff' }} />
          </Box>
        )}
        <IconButton aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'} onClick={toggleDrawer} size="small">
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      {/* Section Subhead */}
      {open && (
        <Box sx={{ px: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.7rem' }}>
            Command Center
          </Typography>
        </Box>
      )}

      {/* Navigation List */}
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <Tooltip title={item.text} placement="right" disableHoverListener={open}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  minHeight: 44,
                  borderRadius: 2,
                  justifyContent: open ? 'initial' : 'center',
                  gap: 1.5,
                  px: open ? 1.5 : 2,
                  transition: 'all 180ms ease',
                  '&:hover': {
                    backgroundColor: (t) => alpha(t.palette.text.primary, 0.05),
                  },
                  '&.active': {
                    backgroundColor: (t) => alpha(t.palette.primary.main, 0.14),
                    color: (t) => t.palette.primary.main,
                    border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.35)}`,
                    boxShadow: (t) => `0 0 12px ${alpha(t.palette.primary.main, 0.15)}`,
                    '& .MuiListItemIcon-root': { color: (t) => t.palette.primary.main },
                    '& .MuiListItemText-primary': { fontWeight: 700 },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                {open && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem' }} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Box flex={1} />

      {/* System Status Pill */}
      {open && (
        <Box sx={{ mx: 1.5, mb: 1, p: 1.25, borderRadius: 2, bgcolor: (t) => alpha(t.palette.text.primary, 0.03), border: (t) => `1px solid ${t.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Turso DB Connected
            </Typography>
          </Box>
        </Box>
      )}

      {/* Back to App */}
      <Box sx={{ p: 1.5 }}>
        <Tooltip title="Back to app" placement="right" disableHoverListener={open}>
          <ListItemButton
            component={RouterLink}
            to="/dashboard"
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              justifyContent: open ? 'flex-start' : 'center',
              gap: 1.5,
              px: open ? 1.5 : 2,
              transition: 'all 150ms ease',
              '&:hover': {
                borderColor: theme.palette.mode === 'light' ? '#CBD5E1' : '#475569',
                backgroundColor: alpha(theme.palette.text.primary, 0.04),
              }
            }}
          >
            <ArrowBackIcon fontSize="small" />
            {open && <ListItemText primary="Back to app" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
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
          backgroundImage: 'none',
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default AdminSidebar;
