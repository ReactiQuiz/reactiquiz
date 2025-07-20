// src/pages/RegisterPage.js
import { useState } from 'react';
import { Box, Grid, Typography, useTheme, Alert, TextField, Button, CircularProgress, Link as MuiLink } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';

function RegisterPage() {
    const theme = useTheme();
    const navigate = useNavigate();

    // Simple, local state for the form
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');
    const [userClass, setUserClass] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setIsSubmitting(true);

        try {
            await apiClient.post('/api/users/register', {
                username, email, password, address, class: userClass
            });

            setSuccessMessage("Registration successful! Redirecting to login...");
            setTimeout(() => {
                navigate('/login', { state: { message: "Registration successful! Please sign in." } });
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Grid container component="main" sx={{ height: '100%' }}>
            <AuthBrandingPanel variant="register" />
            <Grid item xs={12} sm={8} md={5} component={Box} elevation={6} square sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Create Your Account
                    </Typography>
                    
                    <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField margin="normal" required fullWidth label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <TextField margin="normal" required fullWidth label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <TextField margin="normal" required fullWidth label="Password (min. 6 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <TextField margin="normal" required fullWidth label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <TextField margin="normal" required fullWidth label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                        <TextField margin="normal" required fullWidth label="Class (e.g., 6-12)" type="number" value={userClass} onChange={(e) => setUserClass(e.target.value)} />
                        
                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                        {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
                        
                        <Button type="submit" fullWidth variant="contained" disabled={isSubmitting} sx={{ mt: 2, mb: 1, py: 1.5, backgroundColor: theme.palette.primary.main }}>
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
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