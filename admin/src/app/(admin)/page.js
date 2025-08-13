// admin/src/app/(admin)/page.js
'use client'; // This page uses state and event handlers

import { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider, Switch,
  FormControlLabel, Alert, Grid, Link, CircularProgress
} from '@mui/material';
import NextLink from 'next/link'; // Use Next.js's Link for client-side navigation

// --- Reusable Components ---

// SettingsCard: Our base component for settings sections
function SettingsCard({ title, description, children, footerContent }) {
  return (
    <Paper variant="outlined" sx={{ mb: 3 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 3, backgroundColor: 'rgba(0,0,0,0.1)' }}>
        {children}
      </Box>
      {footerContent && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          {footerContent}
        </Box>
      )}
    </Paper>
  );
}

// StatBox: A small component for displaying a single statistic
function StatBox({ title, value, linkHref }) {
    return (
        <Grid item xs={12} sm={4}>
            <Paper component={NextLink} href={linkHref} sx={{ p: 2, textAlign: 'center', textDecoration: 'none', display: 'block', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
                <Typography variant="body2" color="text.secondary">{title}</Typography>
            </Paper>
        </Grid>
    );
}


// --- Main Page Component ---

export default function GeneralSettingsPage() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleMaintenanceToggle = () => {
    setIsLoading(true);
    setStatusMessage('');
    // Simulate an API call
    setTimeout(() => {
      setIsMaintenanceMode(!isMaintenanceMode);
      setStatusMessage(`Site is now ${!isMaintenanceMode ? 'in maintenance mode' : 'live'}.`);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        General
      </Typography>

      {/* --- Site Status Card --- */}
      <SettingsCard
        title="Site Status"
        description="Control the public availability of the main ReactiQuiz application."
        footerContent={
            <>
                {statusMessage && <Typography sx={{flexGrow: 1, alignSelf: 'center', color: 'success.main'}}>{statusMessage}</Typography>}
                <Button variant="contained" onClick={handleMaintenanceToggle} disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
            </>
        }
      >
        <FormControlLabel
          control={<Switch checked={isMaintenanceMode} onChange={handleMaintenanceToggle} />}
          label="Enable Maintenance Mode"
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          When enabled, visitors to the main site will see a maintenance page instead of the application. The admin panel will remain accessible.
        </Typography>
      </SettingsCard>
      
      {/* --- Content Overview Card --- */}
      <SettingsCard
        title="Content Overview"
        description="A high-level summary of the content in your database. Click to manage."
      >
        <Grid container spacing={2}>
            <StatBox title="Registered Users" value="1,234" linkHref="/admin/users" />
            <StatBox title="Quiz Topics" value="82" linkHref="/admin/topics" />
            <StatBox title="Total Questions" value="7,500+" linkHref="/admin/questions" />
        </Grid>
      </SettingsCard>

      {/* --- Services Status Card --- */}
      <SettingsCard
        title="Services Status"
        description="Current operational status of integrated services."
      >
        <Box>
            <Alert severity="success" icon={false} sx={{mb: 1}}><strong>Database Connection (Turso):</strong> Operational</Alert>
            <Alert severity="success" icon={false} sx={{mb: 1}}><strong>AI Service (Google Gemini):</strong> Operational</Alert>
            <Alert severity="warning" icon={false}><strong>Email Service (Nodemailer):</strong> Not Configured</Alert>
        </Box>
      </SettingsCard>

      {/* --- Dangerous Settings Card --- */}
      <SettingsCard
        title="Dangerous Zone"
        description="High-risk actions that can affect site performance or data. Proceed with caution."
        footerContent={
            <Button variant="contained" color="error" disabled>
                Perform Action
            </Button>
        }
      >
        <Alert severity="error" sx={{mb: 2}}>
            These actions are irreversible. Ensure you have a backup before proceeding.
        </Alert>
        <Button variant="outlined" color="error" sx={{ mr: 2 }}>
            Clear Application Cache
        </Button>
        <Button variant="outlined" color="error">
            Wipe User Analytics Data
        </Button>
      </SettingsCard>

    </Box>
  );
}