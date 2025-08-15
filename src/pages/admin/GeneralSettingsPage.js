// src/pages/admin/GeneralSettingsPage.js
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Divider, Switch,
  FormControlLabel, Alert, Grid, CircularProgress, Skeleton
} from '@mui/material';
import apiClient from '../../api/axiosInstance';
import { useNotifications } from '../../contexts/NotificationsContext';

// Reusable StatBox component
function StatBox({ title, value, isLoading }) {
    return (
        <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
                {isLoading ? <Skeleton variant="text" width={80} height={48} sx={{mx: 'auto'}} /> : <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>}
                <Typography variant="body2" color="text.secondary">{title}</Typography>
            </Paper>
        </Grid>
    );
}

function GeneralSettingsPage() {
    const [status, setStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const { addNotification } = useNotifications();

    useEffect(() => {
        apiClient.get('/api/admin/status')
            .then(response => setStatus(response.data))
            .catch(err => setError(err.response?.data?.message || 'Failed to fetch admin status'))
            .finally(() => setIsLoading(false));
    }, []);

    const handleMaintenanceToggle = async () => {
        setIsSaving(true);
        try {
            const response = await apiClient.post('/api/admin/maintenance', {
                enable: !status.isMaintenanceMode
            });
            setStatus(prev => ({ ...prev, isMaintenanceMode: response.data.isMaintenanceMode }));
            addNotification(response.data.message, 'success');
        } catch (err) {
            addNotification(err.response?.data?.message || 'Failed to update status', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
                General Settings
            </Typography>

            {error && <Alert severity="error" sx={{mb: 3}}>{error}</Alert>}

            <Paper variant="outlined" sx={{ mb: 3 }}>
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6">Site Status</Typography>
                </Box>
                <Divider />
                <Box sx={{ p: 3 }}>
                    <FormControlLabel
                        control={<Switch checked={status?.isMaintenanceMode || false} onChange={handleMaintenanceToggle} disabled={isLoading || isSaving} />}
                        label="Enable Maintenance Mode"
                    />
                </Box>
            </Paper>
            
            <Paper variant="outlined" sx={{ mb: 3 }}>
                 <Box sx={{ p: 3 }}>
                    <Typography variant="h6">Content Overview</Typography>
                </Box>
                <Divider />
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <StatBox title="Registered Users" value={status?.userCount} isLoading={isLoading} />
                        <StatBox title="Quiz Topics" value={status?.topicCount} isLoading={isLoading} />
                        <StatBox title="Total Questions" value={status?.questionCount} isLoading={isLoading} />
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
}

export default GeneralSettingsPage;