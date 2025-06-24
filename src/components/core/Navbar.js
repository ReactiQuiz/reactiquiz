// src/components/NavBar.js
import { useState } from 'react';
import {
    AppBar, Button, Toolbar, Typography, IconButton, Box, Avatar, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // <-- IMPORT and USE

function NavBar({
    onIconButtonClick,
    // REMOVED: currentUser, handleLogout props
    onOpenChangePasswordModal,
    showMenuIcon = true,
    forceLoginButton = false
}) {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth(); // <-- USE CONTEXT
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleChangePassword = () => {
        handleCloseUserMenu();
        if (onOpenChangePasswordModal) {
            onOpenChangePasswordModal();
        }
    };

    const handleAccountPageNavigation = () => {
        handleCloseUserMenu();
        navigate('/account');
    };

    const handleLogoutClick = () => {
        handleCloseUserMenu();
        logout(); // <-- USE logout from context
    };

    return (
        <AppBar position="fixed">
            <Toolbar>
                {showMenuIcon && onIconButtonClick && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={onIconButtonClick}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    ReactiQuiz
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Use currentUser from context to decide which button to show */}
                    {forceLoginButton && !currentUser ? ( // if forceLogin is true AND user is not logged in
                         <Button color="inherit" onClick={() => navigate('/account')} startIcon={<AccountCircleIcon />}>
                            Login / Register
                        </Button>
                    ) : !currentUser ? ( // if not forcing, and user is not logged in
                        <Button color="inherit" onClick={() => navigate('/account')} startIcon={<AccountCircleIcon />}>
                            Login / Register
                        </Button>
                    ) : ( // User is logged in
                        <>
                            <Tooltip title="Account options">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '1rem' }}>
                                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ bgcolor: 'secondary.light', width: 40, height: 40, mr: 1.5 }}>
                                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{currentUser.name}</Typography>
                                        {currentUser.email && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                <EmailIcon sx={{ fontSize: '0.9rem', mr: 0.5, opacity: 0.7 }} />
                                                {currentUser.email}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 0.5 }} />
                                <MenuItem onClick={handleAccountPageNavigation}>
                                    <ListItemIcon>
                                        <AccountCircleIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>My Account Page</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleChangePassword}>
                                    <ListItemIcon>
                                        <VpnKeyIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Change Password</ListItemText>
                                </MenuItem>
                                <Divider sx={{ my: 0.5 }} />
                                <MenuItem onClick={handleLogoutClick}>
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Logout</ListItemText>
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default NavBar;