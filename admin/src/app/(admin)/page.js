// admin/src/app/(admin)/page.js
'use client';

import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider, Switch,
  FormControlLabel, Alert, Grid, Link, CircularProgress, Skeleton
} from '@mui/material';
import NextLink from 'next/link';

// Custom hook for fetching admin data (a good practice)
function useAdminStatus() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/admin/status');
        if (!response.ok) {
          throw new Error('Failed to fetch admin status');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStatus();
  }, []);

  return { data, isLoading, error, setData };
}
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

function StatBox({ title, value, linkHref, isLoading }) {
    return (
        <Grid item xs={12} sm={4}>
            <Paper component={isLoading ? Box : NextLink} href={linkHref} sx={{ p: 2, textAlign: 'center', textDecoration: 'none', display: 'block', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                {isLoading ? <Skeleton variant="text" width={80} height={48} sx={{mx: 'auto'}} /> : <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>}
                <Typography variant="body2" color="text.secondary">{title}</Typography>
            </Paper>
        </Grid>
    );
}

// --- Main Page Component ---
export default function GeneralSettingsPage() {
  const { data, isLoading: isLoadingStatus, error, setData } = useAdminStatus();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ message: '', severity: 'success' });

  const handleMaintenanceToggle = async () => {
    setIsSaving(true);
    setSaveStatus({ message: '', severity: 'success' });
    try {
        const response = await fetch('/api/admin/maintenance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enable: !data.isMaintenanceMode })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        // Update local state on success
        setData(prev => ({ ...prev, isMaintenanceMode: result.isMaintenanceMode }));
        setSaveStatus({ message: result.message, severity: 'success' });
    } catch (err) {
        setSaveStatus({ message: err.message, severity: 'error' });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        General
      </Typography>

      {error && <Alert severity="error" sx={{mb: 3}}>{error}</Alert>}

      <SettingsCard
        title="Site Status"
        description="Control the public availability of the ReactiQuiz application."
        footerContent={
            <>
                {saveStatus.message && <Typography sx={{flexGrow: 1, alignSelf: 'center', color: `${saveStatus.severity}.main`}}>{saveStatus.message}</Typography>}
                <Button variant="contained" onClick={handleMaintenanceToggle} disabled={isSaving || isLoadingStatus}>
                    {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                </Button>
            </>
        }
      >
        <FormControlLabel
          control={<Switch checked={data?.isMaintenanceMode || false} onChange={handleMaintenanceToggle} disabled={isLoadingStatus || isSaving} />}
          label="Enable Maintenance Mode"
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          When enabled, visitors will be redirected to a maintenance page. The admin panel remains accessible.
        </Typography>
      </SettingsCard>
      
      <SettingsCard
        title="Content Overview"
        description="High-level summary of the content in your database."
      >
        <Grid container spacing={2}>
            <StatBox title="Registered Users" value={data?.userCount} linkHref="/admin/users" isLoading={isLoadingStatus} />
            <StatBox title="Quiz Topics" value={data?.topicCount} linkHref="/admin/topics" isLoading={isLoadingStatus} />
            <StatBox title="Total Questions" value={data?.questionCount} linkHref="/admin/questions" isLoading={isLoadingStatus} />
        </Grid>
      </SettingsCard>
    </Box>
  );
}