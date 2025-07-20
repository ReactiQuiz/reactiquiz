// src/pages/LoginPage.js
import { useState, useEffect } from 'react';
import { Box, Grid, Typography, useTheme, Alert, TextField, Button, CircularProgress, Link as MuiLink } from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';
import LoginIcon from '@mui/icons-material/Login';

function LoginPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn } = useAuth();

    // State for the form
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // --- START OF FIX ---
    // This state holds the message passed from the registration page
    const [infoMessage, setInfoMessage] = useState(location.state?.message || '');

    // This effect clears the message from the browser's history state
    // so it doesn't reappear if the user navigates away and back.
    useEffect(() => {
        if (location.state?.message) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);
    // --- END OF FIX ---


    const handleLogin = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await signIn(username, password);
            navigate('/subjects');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Grid container component="main" sx={{ height: '100%' }}>
            <AuthBrandingPanel variant="login" />
            <Grid item xs={12} sm={8} md={5} component={Box} elevation={6} square sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Sign In
                    </Typography>
                    
                    {/* This line will now work correctly */}
                    {infoMessage && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{infoMessage}</Alert>}
                    
                    <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal" required fullWidth label="Username"
                            name="username" autoComplete="username" autoFocus
                            value={username} onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal" required fullWidth name="password" label="Password"
                            type="password" autoComplete="current-password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
                        <Button
                            type="submit" fullWidth variant="contained" disabled={isSubmitting}
                            sx={{ py: 1.5, mt: 3, mb: 2, backgroundColor: theme.palette.primary.main }}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                        >
                            {isSubmitting ? 'Signing In...' : 'Login'}
                        </Button>
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