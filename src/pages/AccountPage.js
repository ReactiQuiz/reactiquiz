// src/pages/AboutPage.js
import {
  Box, Typography, Paper, Divider, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Button, useTheme
} from '@mui/material';

// Import the new custom hook
import { useAboutPage } from '../hooks/useAboutPage';

// Import sub-components
import AboutHeader from '../components/about/AboutHeader';
import CreatorProfile from '../components/about/CreatorProfile';
import ContactFormSection from '../components/about/ContactFormSection';

// Constants for creator profile can remain here as they are static data for this page
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
  const ABOUT_US_ACCENT_COLOR = theme.palette.aboutAccent?.main || theme.palette.warning.main;

  // Use the custom hook to get state and handlers for the page
  const {
    isContactDialogOpen,
    dialogContent,
    dialogTitle,
    handleOpenContactDialog,
    handleCloseContactDialog,
  } = useAboutPage();

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderTop: `5px solid ${ABOUT_US_ACCENT_COLOR}` }}>
        <AboutHeader
          title="About ReactiQuiz"
          subtitle="Sharpening Minds, One Quiz at a Time."
          accentColor={ABOUT_US_ACCENT_COLOR}
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1" paragraph sx={{fontSize: {xs: '0.9rem', sm:'1rem'}}}>
          ReactiQuiz is a dynamic and engaging quiz application designed to help students and enthusiasts test and improve their knowledge across various subjects.
          Built with modern web technologies, it aims to provide a seamless and enjoyable learning experience.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <CreatorProfile
          profileImageUrl={YOUR_PROFILE_IMAGE_URL}
          name={YOUR_NAME}
          title={YOUR_TITLE}
          bio={YOUR_BIO}
          email={YOUR_EMAIL}
          phone={YOUR_PHONE}
          linkedinUrl={YOUR_LINKEDIN_URL}
          githubUrl={YOUR_GITHUB_URL}
          discordUrl={YOUR_DISCORD_INVITE_OR_SERVER}
          accentColor={ABOUT_US_ACCENT_COLOR}
          onOpenContactDialog={handleOpenContactDialog} // Pass handler from hook
        />

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', color: ABOUT_US_ACCENT_COLOR, opacity: 0.85, fontSize: {xs: '1.1rem', sm: '1.25rem'} }}>
          Our Mission
        </Typography>
        <Typography variant="body1" paragraph sx={{fontSize: {xs: '0.9rem', sm:'1rem'}}}>
          Our mission is to provide a high-quality, ad-free, and user-friendly platform for learning and self-assessment. We strive to continuously improve ReactiQuiz by adding new features, more topics, and ensuring the accuracy of our content.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <ContactFormSection
            recipientEmail={YOUR_EMAIL}
            accentColor={ABOUT_US_ACCENT_COLOR}
        />
      </Paper>

      {/* Contact Info Dialog uses state and handlers from the hook */}
      <Dialog open={isContactDialogOpen} onClose={handleCloseContactDialog}>
        <DialogTitle sx={{ color: ABOUT_US_ACCENT_COLOR }}>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', fontSize: '1.1rem', wordBreak: 'break-all' }}>
            {dialogContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactDialog} sx={{ color: ABOUT_US_ACCENT_COLOR }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AboutPage;