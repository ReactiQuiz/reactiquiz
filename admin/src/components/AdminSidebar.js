// admin/src/components/AdminSidebar.js
'use client'; // This component uses the usePathname hook

import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, useTheme
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Import the icons we'll use
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';

export default function AdminSidebar({ drawerWidth }) {
  const theme = useTheme();
  const pathname = usePathname();

  const navItems = [
    { text: 'General', path: '/admin', icon: <SettingsIcon /> },
    { text: 'Analytics', path: '/admin/analytics', icon: <BarChartIcon /> },
    { text: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
  ];

  const drawerContent = (
    <div>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          ReactiQuiz
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.path}
              selected={pathname === item.path}
              sx={{
                '&.Mui-selected': {
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}