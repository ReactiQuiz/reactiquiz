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

// No changes needed in this custom hook
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
    // --- START OF FIX: Remove isSaving state ---
    // const [isSaving, setIsSaving] = useState(false);
    // We will now use a single state to represent any loading activity.
    const [isUpdating, setIsUpdating] = useState(false);
    // --- END OF FIX ---

    const handleMaintenanceToggle = async () => {
        if (!stats) return;
        
        // --- START OF FIX: Use the new isUpdating state ---
        setIsUpdating(true); 
        // --- END OF FIX ---
        
        try {
            const response = await apiClient.post('/api/admin/maintenance', {
                enable: !stats.isMaintenanceMode
            });
            
            setStats(prev => ({ ...prev, isMaintenanceMode: response.data.isMaintenanceMode }));
            addNotification(response.data.message, 'success');
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update maintenance status.";
            addNotification(message, 'error');
        } finally {
            // --- START OF FIX: Use the new isUpdating state ---
            setIsUpdating(false);
            // --- END OF FIX ---
        }
    };
    
    // Combine initial loading and update operations into one disabled flag.
    const isActionDisabled = isLoading || isUpdating;
    
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
                        control={<Switch checked={stats?.isMaintenanceMode || false} onChange={handleMaintenanceToggle} disabled={isActionDisabled} />}
                        // --- START OF FIX: Simplified label logic ---
                        label={isUpdating ? "Updating..." : (stats?.isMaintenanceMode ? "On" : "Off")}
                        // --- END OF FIX ---
                    />
                </Box>
            </Paper>

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