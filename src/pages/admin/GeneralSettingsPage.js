// src/pages/admin/GeneralSettingsPage.js
import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Divider, Grid, Alert, Skeleton
} from '@mui/material';
import apiClient from '../../api/axiosInstance'; // Use the configured Axios instance
import { useNotifications } from '../../contexts/NotificationsContext'; // Import for notifications

// --- Reusable StatBox component (Unchanged) ---
function StatBox({ title, value, isLoading }) {
    return (
        <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
                {isLoading ? (
                    <Skeleton variant="text" width={80} height={48} sx={{ mx: 'auto' }} />
                ) : (
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {/* Add a fallback for the initial render before stats is populated */}
                        {typeof value === 'number' ? value.toLocaleString() : '...'}
                    </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
            </Paper>
        </Grid>
    );
}

// --- Main Page Component ---
function GeneralSettingsPage() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // --- START OF THE DEFINITIVE FIX: Robust useEffect with AbortController ---
    useEffect(() => {
        // 1. Create a new AbortController for this effect run.
        const controller = new AbortController();

        const fetchAdminStats = async () => {
            setIsLoading(true);
            setError(''); // Reset error on new fetch
            try {
                // 2. Pass the controller's signal to the Axios request.
                const response = await apiClient.get('/api/admin/status', {
                    signal: controller.signal
                });
                setStats(response.data);
            } catch (err) {
                // 3. If the error was due to cancellation, we don't set an error state.
                if (err.name !== 'CanceledError') {
                    setError(err.response?.data?.message || 'An error occurred while fetching dashboard data.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminStats();

        // 4. The cleanup function: This runs when the component unmounts.
        // It aborts the fetch request, preventing state updates on an unmounted component.
        return () => {
            controller.abort();
        };
    }, []); // Empty dependency array means this still runs once on mount.
    // --- END OF THE DEFINITIVE FIX ---

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
                General
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper variant="outlined">
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6">Content Overview</Typography>
                    <Typography variant="body2" color="text.secondary">
                        A real-time summary of the content in the database.
                    </Typography>
                </Box>
                <Divider />
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <StatBox
                            title="Registered Users"
                            value={stats?.userCount}
                            isLoading={isLoading}
                        />
                        <StatBox
                            title="Quiz Topics"
                            value={stats?.topicCount}
                            isLoading={isLoading}
                        />
                        <StatBox
                            title="Total Questions"
                            value={stats?.questionCount}
                            isLoading={isLoading}
                        />
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
}

export default GeneralSettingsPage;