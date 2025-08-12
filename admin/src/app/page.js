// admin/src/app/page.js
import { Box, Container, Paper, Typography, Divider } from '@mui/material';

export default function AdminHomePage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          ReactiQuiz Admin Panel
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Welcome, Administrator!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the central hub for managing the ReactiQuiz application.
            Future features will include user management, content moderation, and site analytics.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}