// src/pages/LoginPage.js
import { useState, useEffect } from 'react';
import { Box, Grid, Typography, useTheme, Alert, TextField, Button, CircularProgress, Link as MuiLink } from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';
import LoginIcon from '@mui/icons-material/Login';

// A simple helper to manage the user session in localStorage
const loginUser = (userData, token) => {
    localStorage.setItem('reactiquizUser', JSON.stringify(userData));
    localStorage.setItem('reactiquizToken', token);
    // This is useful for complex apps, but for now we'll rely on navigation
    // window.dispatchEvent(new Event('storage'));
};

function LoginPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // All state is simple and local to this component
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [infoMessage, setInfoMessage] = useState(location.state?.message || '');

    // Clear the info message from location state after we've read it
    useEffect(() => {
        if (location.state?.message) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');
        if (!username || !password) {
            setError("Username and password are required.");
            return;
        }
        setIsSubmitting(true);

        try {
            // Direct API call with the correct data structure
            const response = await apiClient.post('/api/users/login', {
                username: username,
                password: password,
            });

            loginUser(response.data.user, response.data.token);
            navigate('/subjects'); // Redirect on success

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
                    {infoMessage && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{infoMessage}</Alert>}
                    
                    {/* The form is now directly inside the page component */}
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