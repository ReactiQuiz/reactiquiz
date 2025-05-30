// src/pages/AboutPage.js
import { useState } from 'react';
import {
    Box, Typography, Paper, Avatar, Link, Grid, Divider,
    IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, Button, TextField, Alert,
    CircularProgress
} from '@mui/material';
import { useTheme, alpha, darken } from '@mui/material/styles'; // <<< IMPORT darken
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import apiClient from '../api/axiosInstance';

const YOUR_PROFILE_IMAGE_URL = `${process.env.PUBLIC_URL}/profile-placeholder.png`;
const YOUR_NAME = "Sanskar Sontakke";
const YOUR_TITLE = "Owner, Developer, Creator";
const YOUR_BIO = "I am a passionate developer with a keen interest in creating educational tools. ReactiQuiz started as a project to combine my love for learning and coding, aiming to provide a useful resource for students. I believe in making education accessible and engaging through technology.";
const YOUR_EMAIL = "sanskarsontakke@gmail.com";
const YOUR_PHONE = "+91 82084 35506";
const YOUR_LINKEDIN_URL = "https://www.linkedin.com/in/sanskar-sontakke-249576357/";
const YOUR_GITHUB_URL = "https://github.com/sanskarsontakke";
const YOUR_DISCORD_INVITE_OR_SERVER = "https://discord.gg/w3fuaTPadQ";

function AboutPage() {
    const theme = useTheme();
    const mathematicsAccentColor = theme.palette.mathematicsAccent?.main || theme.palette.warning.main;

    const [openContactDialog, setOpenContactDialog] = useState(false);
    const [dialogContent, setDialogContent] = useState('');
    const [dialogTitle, setDialogTitle] = useState('');

    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [formStatus, setFormStatus] = useState({ type: '', message: '' });
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);

    const handleOpenContactDialog = (title, content) => {
        setDialogTitle(title);
        setDialogContent(content);
        setOpenContactDialog(true);
    };

    const handleCloseContactDialog = () => {
        setOpenContactDialog(false);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setIsSubmittingForm(true);
        setFormStatus({ type: '', message: '' });

        try {
            const response = await apiClient.post('/api/contact', {
                name: formName,
                email: formEmail,
                message: formMessage,
                recipientEmail: YOUR_EMAIL
            });
            setFormStatus({ type: 'success', message: response.data.message || 'Message sent successfully!' });
            setFormName('');
            setFormEmail('');
            setFormMessage('');
        } catch (error) {
            console.error("Contact form submission error:", error.response || error);
            setFormStatus({ type: 'error', message: error.response?.data?.message || 'Failed to send message. Please try again later or use the direct email link.' });
        } finally {
            setIsSubmittingForm(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto' }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: theme.palette.primary.main, mb: 3 }}>
                    About ReactiQuiz
                </Typography>
                <Typography variant="h6" paragraph sx={{ textAlign: 'center', color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                    Sharpening Minds, One Quiz at a Time.
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="body1" paragraph>
                    ReactiQuiz is a dynamic and engaging quiz application designed to help students and enthusiasts test and improve their knowledge across various subjects.
                    Built with modern web technologies, it aims to provide a seamless and enjoyable learning experience.
                </Typography>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ border: `2px solid ${mathematicsAccentColor}`, borderRadius: 2, p: { xs: 2, sm: 3 }, backgroundColor: alpha(mathematicsAccentColor, 0.05) }}>
                    <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 600, color: mathematicsAccentColor, mb: 3 }}>
                        Meet the Creator
                    </Typography>

                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Avatar
                                alt={YOUR_NAME}
                                src={YOUR_PROFILE_IMAGE_URL}
                                sx={{ width: 150, height: 150, border: `3px solid ${mathematicsAccentColor}` }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'medium', color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black }}>
                                {YOUR_NAME}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                {YOUR_TITLE}
                            </Typography>
                            <Typography variant="body2" paragraph sx={{ color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[700] }}>
                                {YOUR_BIO}
                            </Typography>
                            <Box sx={{ mt: 1.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                <Tooltip title="Send Email">
                                    <IconButton onClick={() => handleOpenContactDialog('Email Address', YOUR_EMAIL)} sx={{ color: mathematicsAccentColor, '&:hover': { backgroundColor: alpha(mathematicsAccentColor, 0.1) } }}>
                                        <EmailIcon />
                                    </IconButton>
                                </Tooltip>
                                {YOUR_PHONE && (
                                    <Tooltip title="View Phone Number">
                                        <IconButton onClick={() => handleOpenContactDialog('Phone Number', YOUR_PHONE)} sx={{ color: mathematicsAccentColor, '&:hover': { backgroundColor: alpha(mathematicsAccentColor, 0.1) } }}>
                                            <PhoneIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="LinkedIn Profile">
                                    <Link href={YOUR_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" sx={{ color: mathematicsAccentColor, '&:hover': { backgroundColor: alpha(mathematicsAccentColor, 0.1) }, display: 'inline-flex', borderRadius: '50%', p: '8px' }}>
                                        <LinkedInIcon />
                                    </Link>
                                </Tooltip>
                                <Tooltip title="GitHub Profile">
                                    <Link href={YOUR_GITHUB_URL} target="_blank" rel="noopener noreferrer" sx={{ color: mathematicsAccentColor, '&:hover': { backgroundColor: alpha(mathematicsAccentColor, 0.1) }, display: 'inline-flex', borderRadius: '50%', p: '8px' }}>
                                        <GitHubIcon />
                                    </Link>
                                </Tooltip>
                                {YOUR_DISCORD_INVITE_OR_SERVER && (
                                    <Tooltip title="Join Discord Server">
                                        <Link href={YOUR_DISCORD_INVITE_OR_SERVER} target="_blank" rel="noopener noreferrer" sx={{ color: mathematicsAccentColor, '&:hover': { backgroundColor: alpha(mathematicsAccentColor, 0.1) }, display: 'inline-flex', borderRadius: '50%', p: '8px', fontSize: '1.25rem' }}>
                                            <FontAwesomeIcon icon={faDiscord} />
                                        </Link>
                                    </Tooltip>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', color: theme.palette.primary.light }}>
                    Our Mission
                </Typography>
                <Typography variant="body1" paragraph>
                    Our mission is to provide a high-quality, ad-free, and user-friendly platform for learning and self-assessment. We strive to continuously improve ReactiQuiz by adding new features, more topics, and ensuring the accuracy of our content.
                </Typography>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', color: theme.palette.primary.light, mt: 3 }}>
                    Contact Us
                </Typography>
                <Typography variant="body1" paragraph>
                    Have questions or feedback? Fill out the form below, and we'll get back to you as soon as possible.
                </Typography>
                <Box component="form" onSubmit={handleFormSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Your Name"
                        name="name"
                        autoComplete="name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Your Email Address"
                        name="email"
                        autoComplete="email"
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="message"
                        label="Your Message"
                        id="message"
                        multiline
                        rows={4}
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                    />
                    {formStatus.message && (
                        <Alert severity={formStatus.type === 'success' ? 'success' : 'error'} sx={{ mt: 2 }}> {/* Ensure severity is valid */}
                            {formStatus.message}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isSubmittingForm}
                        sx={{ mt: 3, mb: 2, backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: darken(theme.palette.primary.main, 0.15) } }} // Fixed darken here
                        startIcon={isSubmittingForm ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    >
                        {isSubmittingForm ? 'Sending...' : 'Send Message'}
                    </Button>
                </Box>
            </Paper>

            <Dialog open={openContactDialog} onClose={handleCloseContactDialog}>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ textAlign: 'center', fontSize: '1.1rem', wordBreak: 'break-all' }}>
                        {dialogContent}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseContactDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AboutPage;