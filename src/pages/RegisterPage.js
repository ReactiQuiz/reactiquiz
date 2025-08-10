// src/pages/RegisterPage.js
import { useState } from 'react';
import { Box, Grid, Typography, useTheme, Alert, TextField, Button, Link as MuiLink, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material'; // <-- Add FormControl etc.
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';
import { useNotifications } from '../contexts/NotificationsContext';    

const CLASS_OPTIONS = ['6', '7', '8', '9', '10', '11', '12']; // Define options

function RegisterPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');
    // --- START OF CHANGES ---
    const [phone, setPhone] = useState('');
    const [userClass, setUserClass] = useState(''); // Default to empty
    // --- END OF CHANGES ---
    const { addNotification } = useNotifications();
    const [error, setError] = useState(''); // Keep for local form errors
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            addNotification('Passwords do not match.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            // --- START OF CHANGES ---
            await signUp({ username, email, password, address, phone, class: userClass });
            // --- END OF CHANGES ---
            navigate('/login', { state: { message: "Registration successful! Please sign in." } });
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            addNotification(message, 'error');
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
                        {/* --- START OF CHANGES --- */}
                        <TextField margin="dense" fullWidth label="Phone Number (Optional)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        {/* --- END OF CHANGES --- */}
                        <TextField margin="dense" required fullWidth label="Password (min. 6 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <TextField margin="dense" required fullWidth label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <TextField margin="dense" required fullWidth label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                        {/* --- START OF CHANGES: Class Dropdown --- */}
                        <FormControl fullWidth margin="dense" required>
                            <InputLabel id="class-select-label">Class</InputLabel>
                            <Select
                                labelId="class-select-label"
                                value={userClass}
                                label="Class"
                                onChange={(e) => setUserClass(e.target.value)}
                            >
                                <MenuItem value=""><em>Select Class</em></MenuItem>
                                {CLASS_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}th
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {/* --- END OF CHANGES --- */}

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