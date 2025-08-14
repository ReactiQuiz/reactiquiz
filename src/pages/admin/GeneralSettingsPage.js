// src/pages/admin/GeneralSettingsPage.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Divider, 
  Switch, 
  FormControlLabel, 
  Alert, 
  Grid, 
  CircularProgress, 
  Skeleton 
} from '@mui/material';
import apiClient from '../../api/axiosInstance';

/**
 * Reusable component for a consistent settings section layout.
 * @param {string} title - The title of the settings section.
 * @param {string} description - A brief explanation of the setting.
 * @param {React.ReactNode} action - The action button(s) for the section footer.
 * @param {React.ReactNode} children - The content/controls for the section.
 */
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
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Box sx={{ p: 2 }}>{children}</Box>
          {action && (
            <>
              <Divider />
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'action.hover' }}>
                {action}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}

/**
 * Reusable component for displaying a single statistic.
 * @param {string} title - The label for the statistic.
 * @param {number | string} value - The value of the statistic.
 * @param {boolean} isLoading - Controls whether to show a skeleton loader.
 */
function StatBox({ title, value, isLoading }) {
    return (
        <Grid item xs={12} sm={4}>
            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>
                    {title}
                </Typography>
                {isLoading ? (
                    <Skeleton variant="text" width={60} height={40} />
                ) : (
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {value !== undefined && value !== null ? value.toLocaleString() : 'N/A'}
                    </Typography>
                )}
            </Box>
        </Grid>
    );
}


function GeneralSettingsPage() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Fetch all admin stats when the component mounts
    useEffect(() => {
        apiClient.get('/admin/stats')
            .then(response => {
                setStats(response.data);
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Failed to fetch admin statistics.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []); // Empty dependency array means this runs once on mount

    // Handler for the maintenance mode toggle switch
    const handleMaintenanceToggle = async () => {
        if (!stats) return; // Prevent action if initial data hasn't loaded
        setIsSaving(true);
        setError(''); // Clear previous errors
        try {
            const response = await apiClient.post('/api/admin/maintenance', {
                enable: !stats.isMaintenanceMode
            });
            // Update local state with the confirmed state from the server
            setStats(prev => ({ ...prev, isMaintenanceMode: response.data.isMaintenanceMode }));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update maintenance status.");
            // Revert the switch visually on failure
            setStats(prev => ({ ...prev, isMaintenanceMode: prev.isMaintenanceMode }));
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
    
          <SettingsSection
            title="Site Status"
            description="Enable maintenance mode to show a maintenance page to all non-admin visitors."
            action={
              <Button variant="contained" onClick={handleMaintenanceToggle} disabled={isSaving || isLoading}>
                {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
              </Button>
            }
          >
            <FormControlLabel
              control={<Switch checked={stats?.isMaintenanceMode || false} onChange={handleMaintenanceToggle} disabled={isLoading || isSaving} />}
              label="Application is in Maintenance Mode"
            />
          </SettingsSection>
    
          <SettingsSection
            title="Content Overview"
            description="A real-time summary of the content in your database."
          >
            <Grid container spacing={2}>
                <StatBox title="Registered Users" value={stats?.userCount} isLoading={isLoading} />
                <StatBox title="Quiz Topics" value={stats?.topicCount} isLoading={isLoading} />
                <StatBox title="Total Questions" value={stats?.questionCount} isLoading={isLoading} />
            </Grid>
          </SettingsSection>
        </Box>
      );
}

export default GeneralSettingsPage;