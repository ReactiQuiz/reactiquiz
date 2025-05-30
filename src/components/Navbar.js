// src/components/NavBar.js
import {
    AppBar, Toolbar, Typography, IconButton, Button, Box, Avatar, Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// import LogoutIcon from '@mui/icons-material/Logout'; // Removed
import { useNavigate } from 'react-router-dom';

function NavBar({ onIconButtonClick, currentUser /* Removed onLogoutClick */ }) {
    const navigate = useNavigate();

    const handleAccountNavigation = () => {
        navigate('/account');
    };

    return (
        <AppBar position="fixed">
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onIconButtonClick}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    ReactiQuiz
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {currentUser ? (
                        <>
                            <Tooltip title={`Logged in as ${currentUser.name}`}>
                                <IconButton onClick={handleAccountNavigation} color="inherit">
                                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '1rem' }}>
                                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            <Typography 
                                onClick={handleAccountNavigation} 
                                sx={{ 
                                    mr: 2, 
                                    display: { xs: 'none', sm: 'block' }, 
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                {currentUser.name}
                            </Typography>
                            {/* Logout Button Removed */}
                        </>
                    ) : (
                        <Button color="inherit" onClick={handleAccountNavigation} startIcon={<AccountCircleIcon />}>
                            Login / Account
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default NavBar;