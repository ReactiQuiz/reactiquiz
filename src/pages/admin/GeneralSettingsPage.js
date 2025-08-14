// src/pages/admin/GeneralSettingsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Switch, 
  FormControlLabel, 
  Alert, 
  Grid, 
  Skeleton,
} from '@mui/material';
import { useNotifications } from '../../contexts/NotificationsContext';
import apiClient from '../../api/axiosInstance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Custom hook to manage the data fetching and state for this page
function useAdminStats() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { addNotification } = useNotifications();

    // Encapsulate the fetching logic into a memoized function
    const fetchStats = useCallback(() => {
        console.log("HOOK: Starting to fetch stats...");
        setIsLoading(true);
        apiClient.get('/admin/stats')
            .then(response => {
                console.log("HOOK: Successfully fetched stats:", response.data);
                setStats(response.data);
            })
            .catch((err) => {
                const message = err.response?.data?.message || 'Failed to fetch admin statistics.';
                console.error("HOOK: Error fetching stats:", message);
                setError(message);
                addNotification(message, 'error');
            })
            .finally(() => {
                console.log("HOOK: Finished fetching stats.");
                setIsLoading(false);
            });
    }, [addNotification]);

    // Fetch stats when the component first mounts
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Return the state and the refetch function
    return { stats, isLoading, error, refetchStats: fetchStats };
}

function GeneralSettingsPage() {
    const { addNotification } = useNotifications();
    // --- START OF FIX: Use the refetch function from the hook ---
    const { stats, isLoading, error, refetchStats } = useAdminStats();
    const [isToggling, setIsToggling] = useState(false); // State specifically for the toggle action
    // --- END OF FIX ---

    const handleMaintenanceToggle = async () => {
        if (!stats) return; // Guard against clicking before initial load
        
        console.log("HANDLER: Toggle initiated. Current state is:", stats.isMaintenanceMode);
        setIsToggling(true);
        
        try {
            const response = await apiClient.post('/api/admin/maintenance', {
                enable: !stats.isMaintenanceMode
            });
            
            console.log("HANDLER: API call successful. Response:", response.data);
            addNotification(response.data.message, 'success');
            
            // --- THIS IS THE CRITICAL FIX ---
            // Instead of manually setting state, we re-fetch the single source of truth from the server.
            console.log("HANDLER: Refetching stats to confirm change...");
            refetchStats();
            // --- END OF FIX ---

        } catch (err) {
            const message = err.response?.data?.message || "Failed to update maintenance status.";
            console.error("HANDLER: API call failed.", message);
            addNotification(message, 'error');
        } finally {
            console.log("HANDLER: Toggle action finished.");
            setIsToggling(false);
        }
    };
    
    // Determine the disabled state based on initial load OR the toggle action
    const isActionDisabled = isLoading || isToggling;

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
                General
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Manage site-wide settings and view content summaries.
            </Typography>
    
            {error && <Alert severity="error" sx={{mb: 3}}>{error}</Alert>}
    
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Site Status</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography>Maintenance Mode</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Redirect all visitors to a maintenance page.
                        </Typography>
                    </Box>
                    <FormControlLabel
                        sx={{ mr: 0 }}
                        // The switch is ALWAYS controlled by the `stats` object, the single source of truth.
                        control={<Switch checked={stats?.isMaintenanceMode || false} onChange={handleMaintenanceToggle} disabled={isActionDisabled} />}
                        // The label reflects the current action being performed.
                        label={isToggling ? "Updating..." : (stats?.isMaintenanceMode ? "On" : "Off")}
                    />
                </Box>
            </Paper>

            {/* Content Overview and Services Status are unchanged */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Content Overview</Typography>
                <Grid container spacing={3}>
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <Grid item xs={12} sm={4} key={i}>
                                <Skeleton variant="text" height={20} width="60%" />
                                <Skeleton variant="text" height={40} width="40%" />
                            </Grid>
                        ))
                    ) : (
                        <>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="overline" color="text.secondary">Registered Users</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.userCount?.toLocaleString() ?? 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="overline" color="text.secondary">Quiz Topics</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.topicCount?.toLocaleString() ?? 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="overline" color="text.secondary">Total Questions</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.questionCount?.toLocaleString() ?? 'N/A'}</Typography>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Paper>

             <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Services Status</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon sx={{ color: 'success.main', mr: 1.5 }} />
                        <Box>
                            <Typography>Database Connection (Turso)</Typography>
                            <Typography variant="body2" color="text.secondary">Operational</Typography>
                        </Box>
                    </Grid>
                     <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <ErrorIcon sx={{ color: 'warning.main', mr: 1.5 }} />
                        <Box>
                            <Typography>Email Service (Nodemailer)</Typography>
                            <Typography variant="body2" color="text.secondary">Not Configured</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}

export default GeneralSettingsPage;