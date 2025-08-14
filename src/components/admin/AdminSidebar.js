// src/components/admin/AdminSidebar.js
import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';

function AdminSidebar({ drawerWidth }) {
    const theme = useTheme();

    const navItems = [
        { text: 'General', path: '/admin/general', icon: <SettingsIcon /> },
        { text: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', position: 'relative' },
            }}
        >
            <Box sx={{ p: 2 }}>
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
                                '&.active': {
                                    borderRight: `3px solid ${theme.palette.primary.main}`,
                                    backgroundColor: 'action.selected',
                                }
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
}
export default AdminSidebar;