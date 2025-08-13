// admin/src/app/(admin)/page.js
'use client';

import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography,TextField, Button, Divider, Switch,
  FormControlLabel, Alert, Grid, Link, CircularProgress, Skeleton
} from '@mui/material';
import NextLink from 'next/link';
import apiClient from '../../lib/apiClient'; // <-- Use our new admin-specific API client

// --- Custom Hooks for Data Fetching ---
function useMaintenanceStatus() {
  const [data, setData] = useState({ isMaintenanceMode: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/admin/status')
      .then(response => setData(response.data))
      .catch(err => setError(err.message || 'Failed to fetch status'))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error, setData };
}

function useContentCounts() {
  const [counts, setCounts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch from the Next.js Route Handler
    fetch('/admin/api/content-counts')
      .then(res => res.json())
      .then(data => setCounts(data))
      .catch(() => setCounts({ userCount: 'N/A', topicCount: 'N/A', questionCount: 'N/A' }))
      .finally(() => setIsLoading(false));
  }, []);

  return { counts, isLoading };
}


// --- Reusable UI Components ---
function SettingsSection({ title, description, action, children }) {
  return (
    <Grid container spacing={2} sx={{ mb: 4, alignItems: 'flex-start' }}>
      <Grid item xs={12} md={4}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box>{children}</Box>
          {action && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {action}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}

function StatBox({ title, value, isLoading }) {
    return (
        <Grid item xs={12} sm={4}>
            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{title}</Typography>
                {isLoading ? <Skeleton variant="text" width={60} height={40} /> : <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>}
            </Box>
        </Grid>
    );
}


// --- Main Page Component ---
export default function GeneralSettingsPage() {
  const { data: statusData, isLoading: isLoadingStatus, error: statusError, setData: setStatusData } = useMaintenanceStatus();
  const { counts, isLoading: isLoadingCounts } = useContentCounts();
  const [isSaving, setIsSaving] = useState(false);

  const handleMaintenanceToggle = async () => {
    setIsSaving(true);
    try {
        const response = await apiClient.post('/api/admin/maintenance', {
            enable: !statusData.isMaintenanceMode
        });
        setStatusData(prev => ({ ...prev, isMaintenanceMode: response.data.isMaintenanceMode }));
    } catch (err) {
        // You can add a notification here if you like
        console.error("Failed to toggle maintenance mode", err);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        General
      </Typography>

      {statusError && <Alert severity="error" sx={{mb: 3}}>{statusError}</Alert>}

      <SettingsSection
        title="Site Status"
        description="Enable maintenance mode to show a maintenance page to all non-admin visitors."
        action={
          <Button variant="contained" onClick={handleMaintenanceToggle} disabled={isSaving || isLoadingStatus}>
            {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
          </Button>
        }
      >
        <FormControlLabel
          control={<Switch checked={statusData?.isMaintenanceMode || false} onChange={handleMaintenanceToggle} disabled={isLoadingStatus || isSaving} />}
          label="Application is in Maintenance Mode"
        />
      </SettingsSection>

      <SettingsSection
        title="Content Overview"
        description="A real-time summary of the content in your database."
      >
        <Grid container spacing={2}>
            <StatBox title="Registered Users" value={counts?.userCount} isLoading={isLoadingCounts} />
            <StatBox title="Quiz Topics" value={counts?.topicCount} isLoading={isLoadingCounts} />
            <StatBox title="Total Questions" value={counts?.questionCount} isLoading={isLoadingCounts} />
        </Grid>
      </SettingsSection>

      <SettingsSection
        title="Project ID"
        description="The unique identifier for this project on Vercel."
      >
        <TextField fullWidth disabled value="prj_JmYz..." />
      </SettingsSection>
    </Box>
  );
}