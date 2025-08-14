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
  useTheme,
  Divider
} from '@mui/material';
import { useNotifications } from '../../contexts/NotificationsContext';
import apiClient from '../../api/axiosInstance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Custom hook is good, no changes needed here
function useAdminStats() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { addNotification } = useNotifications();

    const fetchStats = useCallback(() => {
        setIsLoading(true);
        apiClient.get('/admin/stats')
            .then(response => {
                setStats(response.data);
            })
            .catch((err) => {
                const message = err.response?.data?.message || 'Failed to fetch admin statistics.';
                setError(message);
                addNotification(message, 'error');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [addNotification]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, error, setStats };
}

function GeneralSettingsPage() {
    const { addNotification } = useNotifications();
    const { stats, isLoading, error, setStats } = useAdminStats();
    // --- START OF THE DEFINITIVE FIX ---
    const [isSaving, setIsSaving] = useState(false);

    const handleMaintenanceToggle = async () => {
        if (!stats) return;
        setIsSaving(true);
        try {
            const response = await apiClient.post('/api/admin/maintenance', {
                enable: !stats.isMaintenanceMode
            });
            // This logic is correct: update the stats object with the server's response
            setStats(prev => ({ ...prev, isMaintenanceMode: response.data.isMaintenanceMode }));
            addNotification(response.data.message, 'success');
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update maintenance status.";
            addNotification(message, 'error');
        } finally {
            // This correctly sets the saving state back to false
            setIsSaving(false);
        }
    };
    
    // Create a variable to determine the label text.
    // This ensures that every time the component re-renders, the label is re-evaluated.
    let maintenanceLabel = "Off";
    if (isLoading) {
        maintenanceLabel = <Skeleton width={40} />;
    } else if (isSaving) {
        maintenanceLabel = "Updating...";
    } else if (stats?.isMaintenanceMode) {
        maintenanceLabel = "On";
    }
    // --- END OF THE DEFINITIVE FIX ---
    
    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
                General
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Manage site-wide settings and view content summaries.
            </Typography>
    
            {error && <Alert severity="error" sx={{mb: 3}}>{error}</Alert>}
    
            {/* --- Site Status Card --- */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Site Status</Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography>Maintenance Mode</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Redirect all visitors to a maintenance page.
                        </Typography>
                    </Box>
                    <FormControlLabel
                        sx={{ mr: 0 }}
                        control={<Switch checked={stats?.isMaintenanceMode || false} onChange={handleMaintenanceToggle} disabled={isLoading || isSaving} />}
                        label={maintenanceLabel}
                    />
                </Box>
            </Paper>

            {/* --- Content Overview Card --- */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Content Overview</Typography>
                <Divider sx={{ my: 2 }} />
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

             {/* --- Services Status Card --- */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Services Status</Typography>
                <Divider sx={{ my: 2 }} />
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