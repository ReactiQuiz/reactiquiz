// src/components/core/Navbar.tsx
/**
 * Navbar Component
 * 
 * This component renders the main navigation bar at the top of the application.
 * It includes the app logo, menu icon, and user account menu with options
 * for account management, password change, and logout.
 */
import React, { useState } from 'react';
import {
    AppBar, Button, Toolbar, Typography, IconButton, Box, Avatar, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * NavBarProps Interface
 * 
 * Props for the NavBar component.
 */
interface NavBarProps {
    onIconButtonClick?: () => void; // Callback for menu icon click (opens drawer)
    onOpenChangePasswordModal?: () => void; // Callback for opening change password modal
    showMenuIcon?: boolean; // Whether to show the menu icon (default: true)
    forceLoginButton?: boolean; // Force showing login button even when user is logged in (default: false)
}

/**
 * NavBar Component
 * 
 * Main navigation bar component that displays:
 * - App logo/branding
 * - Menu icon (for opening drawer)
 * - Login button (for unauthenticated users)
 * - User avatar and account menu (for authenticated users)
 * 
 * The account menu includes:
 * - User name and email display
 * - My Account Page navigation
 * - Change Password option
 * - Logout option
 * 
 * @param {NavBarProps} props - Component props
 * @returns {JSX.Element} Navigation bar component
 */
const NavBar: React.FC<NavBarProps> = ({
    onIconButtonClick,
    onOpenChangePasswordModal,
    showMenuIcon = true,
    forceLoginButton = false
}) => {
    // Navigation hook for routing
    const navigate = useNavigate();
    // Get authentication state and sign out function
    const { currentUser, signOut } = useAuth();
    // State for user menu anchor (controls menu position)
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    /**
     * Handle Open User Menu
     * 
     * Opens the user account menu when avatar is clicked.
     * 
     * @param {React.MouseEvent<HTMLElement>} event - Click event
     */
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    /**
     * Handle Close User Menu
     * 
     * Closes the user account menu.
     */
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    /**
     * Handle Change Password
     * 
     * Closes the menu and opens the change password modal.
     */
    const handleChangePassword = () => {
        handleCloseUserMenu();
        // Open change password modal if callback is provided
        if (onOpenChangePasswordModal) {
            onOpenChangePasswordModal();
        }
    };

    /**
     * Handle Account Page Navigation
     * 
     * Navigates to the account page and closes the menu.
     */
    const handleAccountPageNavigation = () => {
        handleCloseUserMenu();
        navigate('/account');
    };

    /**
     * Handle Logout Click
     * 
     * Closes the menu and signs out the user.
     */
    const handleLogoutClick = () => {
        handleCloseUserMenu();
        // Call the signOut function from auth context
        signOut();
    };

    return (
        <AppBar position="fixed">
            <Toolbar>
                {/* Menu Icon Button
                    Shows hamburger menu icon to open the drawer.
                    Only visible if showMenuIcon is true and callback is provided. */}
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
                
                {/* App Logo/Branding */}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    ReactiQuiz
                </Typography>
                
                {/* Right Side Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Use currentUser from context to decide which button to show */}
                    {/* Show Login Button if user is not logged in (or if forced) */}
                    {forceLoginButton && !currentUser ? ( // if forceLogin is true AND user is not logged in
                         <Button color="inherit" onClick={() => navigate('/login')} startIcon={<AccountCircleIcon />}>
                            Login / Register
                        </Button>
                    ) : !currentUser ? ( // if not forcing, and user is not logged in
                        <Button color="inherit" onClick={() => navigate('/login')} startIcon={<AccountCircleIcon />}>
                            Login / Register
                        </Button>
                    ) : ( // User is logged in - show avatar and account menu
                        <>
                            {/* User Avatar Button */}
                            <Tooltip title="Account options">
                                <IconButton aria-label="Account options" onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '1rem' }}>
                                        {/* Show user's first initial or default icon */}
                                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            
                            {/* User Account Menu */}
                            <Menu
                                sx={{ mt: '45px' }} // Margin from top for positioning
                                id="menu-appbar"
                                anchorEl={anchorElUser} // Anchor element for menu position
                                anchorOrigin={{
                                    vertical: 'top', // Position menu below anchor
                                    horizontal: 'right', // Align to right side
                                }}
                                keepMounted // Keep menu in DOM for performance
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)} // Control menu visibility
                                onClose={handleCloseUserMenu} // Close handler
                            >
                                {/* User Info Section */}
                                <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ bgcolor: 'secondary.light', width: 40, height: 40, mr: 1.5 }}>
                                        {/* User's first initial */}
                                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
                                    </Avatar>
                                    <Box>
                                        {/* User name */}
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{currentUser.name}</Typography>
                                        {/* User email (if available) */}
                                        {currentUser.email && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                <EmailIcon sx={{ fontSize: '0.9rem', mr: 0.5, opacity: 0.7 }} />
                                                {currentUser.email}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                
                                <Divider sx={{ my: 0.5 }} />
                                
                                {/* My Account Page Menu Item */}
                                <MenuItem onClick={handleAccountPageNavigation}>
                                    <ListItemIcon>
                                        <AccountCircleIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>My Account Page</ListItemText>
                                </MenuItem>
                                
                                {/* Change Password Menu Item */}
                                <MenuItem onClick={handleChangePassword}>
                                    <ListItemIcon>
                                        <VpnKeyIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Change Password</ListItemText>
                                </MenuItem>
                                
                                <Divider sx={{ my: 0.5 }} />
                                
                                {/* Logout Menu Item */}
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
};

export default NavBar;