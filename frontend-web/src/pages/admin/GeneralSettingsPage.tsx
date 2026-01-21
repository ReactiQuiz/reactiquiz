// src/pages/admin/GeneralSettingsPage.tsx
/**
 * General Settings Page (Admin)
 * 
 * This page displays general admin settings and statistics. Shows
 * content overview with user count, topic count, and question count.
 * Provides a dashboard view for administrators.
 */
import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Divider, Grid, Alert
} from '@mui/material';
import apiClient from '../../api/axiosInstance';
import StatBox from '../../components/admin/StatBox';

/**
 * General Settings Page Component
 * 
 * Displays admin general settings with:
 * - Content overview section
 * - Statistics boxes (users, topics, questions)
 * - Loading states during data fetch
 * - Error message display
 * - AbortController for request cancellation
 * - Responsive grid layout
 * 
 * This page is only accessible to admin users. Fetches
 * statistics from the admin API endpoint.
 * 
 * @returns {JSX.Element} General settings page with statistics
 */
function GeneralSettingsPage() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    /**
     * Fetch Admin Stats Effect
     * 
     * Fetches admin statistics from the API:
     * - Creates AbortController for request cancellation
     * - Fetches admin status/statistics
     * - Handles errors (excluding cancellation)
     * - Cleans up on unmount to prevent memory leaks
     * 
     * Uses AbortController to properly cancel requests when
     * component unmounts, preventing state updates on unmounted components.
     */
    useEffect(() => {
        // Create a new AbortController for this effect run
        const controller = new AbortController();

        /**
         * Fetch Admin Stats
         * 
         * Fetches admin statistics from the API endpoint.
         * Handles loading states and errors appropriately.
         */
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
                if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
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