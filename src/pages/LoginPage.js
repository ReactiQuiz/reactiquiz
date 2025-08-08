// src/pages/LoginPage.js
import { useState, useEffect } from 'react';
import { Box, Grid, Typography, Alert, TextField, Button, Link as MuiLink, Paper, CircularProgress } from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';
import LoginIcon from '@mui/icons-material/Login';
import { useNotifications } from '../contexts/NotificationsContext'; 

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { addNotification } = useNotifications();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [infoMessage, setInfoMessage] = useState(location.state?.message || '');

    useEffect(() => {
        if (location.state?.message) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleLogin = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            await signIn(username, password);
            addNotification('Login successful!', 'success'); // <-- Success notification
            navigate('/dashboard');
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
            addNotification(message, 'error'); // <-- Use the new system for errors
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Grid container component="main" sx={{ height: '100vh' }}>
            <AuthBrandingPanel variant="login" />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Sign In
                    </Typography>
                    
                    {infoMessage && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{infoMessage}</Alert>}
                    
                    <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField margin="normal" required fullWidth label="Username" autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} />
                        <TextField margin="normal" required fullWidth label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
                        
                        {/* --- START OF FIX: Added loading indicator --- */}
                        <Button
                            type="submit" fullWidth variant="contained" disabled={isSubmitting}
                            sx={{ py: 1.5, mt: 3, mb: 2 }}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                        >
                            {isSubmitting ? 'Signing In...' : 'Login'}
                        </Button>
                        {/* --- END OF FIX --- */}

                        <Typography variant="body2" sx={{ textAlign: 'center' }}>
                            Don't have an account?{' '}
                            <MuiLink component={RouterLink} to="/register" variant="body2" sx={{ fontWeight: 'bold' }}>
                                Sign Up
                            </MuiLink>
                        </Typography>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}

export default LoginPage;