// src/pages/admin/GeneralSettingsPage.js
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Divider, Grid, Alert, Skeleton
} from '@mui/material';
import apiClient from '../../api/axiosInstance';

// --- Reusable StatBox component ---
// Displays either a Skeleton loader or the fetched value.
function StatBox({ title, value, isLoading }) {
    return (
        <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
                {isLoading ? (
                    <Skeleton variant="text" width={80} height={48} sx={{ mx: 'auto' }} />
                ) : (
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {value.toLocaleString()}
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
    // State to hold the fetched data
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // useEffect hook to fetch data when the component mounts
    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const response = await apiClient.get('/api/admin/status');
                setStats(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred while fetching dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminStats();
    }, []); // Empty dependency array means this runs once on mount

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
                General
            </Typography>

            {error && <Alert severity="error" sx={{mb: 3}}>{error}</Alert>}

            {/* The Site Status card has been completely removed. */}
            
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