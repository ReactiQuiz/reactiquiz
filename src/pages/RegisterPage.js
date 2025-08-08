// src/pages/RegisterPage.js
import { useState } from 'react';
import { Box, Grid, Typography, useTheme, Alert, TextField, Button, Link as MuiLink, Paper } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';
import { useNotifications } from '../contexts/NotificationsContext';

function RegisterPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');
    const [userClass, setUserClass] = useState('');
    const { addNotification } = useNotifications();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(''); // General error state
    const [passwordError, setPasswordError] = useState(''); // Specific password error state

    const handleRegister = async (event) => {
        event.preventDefault();
        setPasswordError('');

        if (password !== confirmPassword) {
            addNotification('Passwords do not match.', 'error');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
        if (!passwordRegex.test(password)) {
            setPasswordError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
            return;
        }

        setIsSubmitting(true);
        try {
            await signUp({ username, email, password, address, class: userClass });
            // Redirect to login with a success message
            navigate('/login', { state: { message: "Registration successful! Please sign in." } });
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            addNotification(message, 'error'); // <-- Use notification system for errors
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Grid container component="main" sx={{ height: '100vh' }}>
            <AuthBrandingPanel variant="register" />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <Box
                    sx={{
                        my: 8, mx: 4,
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Create Your Account
                    </Typography>

                    <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField margin="dense" required fullWidth label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <TextField margin="dense" required fullWidth label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <TextField margin="dense" required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!passwordError} helperText={passwordError || "Min. 8 characters, with uppercase, lowercase, and a number."} />
                        <TextField margin="dense" required fullWidth label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <TextField margin="dense" required fullWidth label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                        <TextField margin="dense" required fullWidth label="Class (e.g., 6-12)" type="number" value={userClass} onChange={(e) => setUserClass(e.target.value)} />

                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                        <Button type="submit" fullWidth variant="contained" disabled={isSubmitting} sx={{ mt: 2, mb: 1, py: 1.5 }}>
                            Sign Up
                        </Button>
                        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                            Already have an account?{' '}
                            <MuiLink component={RouterLink} to="/login" variant="body2" sx={{ fontWeight: 'bold' }}>
                                Sign In
                            </MuiLink>
                        </Typography>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}

export default RegisterPage;