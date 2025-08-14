// src/pages/admin/GeneralSettingsPage.js
import React from 'react';
import { Box, Paper, Typography, Switch, Grid, Skeleton, Divider, List, ListItem, ListItemText, Avatar } from '@mui/material';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { formatDistanceToNow } from 'date-fns';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import QuizIcon from '@mui/icons-material/Quiz';

function StatCard({ title, value, isLoading }) {
    return (
        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="overline" color="text.secondary">{title}</Typography>
            {isLoading ? (
                <Skeleton variant="text" height={48} width="50%" />
            ) : (
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {value?.toLocaleString() ?? 'N/A'}
                </Typography>
            )}
        </Paper>
    );
}

function GeneralSettingsPage() {
    const { dashboardData, isLoading, toggleMaintenanceMode } = useAdminDashboard();

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
                Dashboard
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Overview of site status, content, and recent activity.
            </Typography>

            <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} lg={8}>
                    {/* Content Overview */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Content Overview</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <StatCard title="Registered Users" value={dashboardData?.counts?.users} isLoading={isLoading} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <StatCard title="Quiz Topics" value={dashboardData?.counts?.topics} isLoading={isLoading} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <StatCard title="Total Questions" value={dashboardData?.counts?.questions} isLoading={isLoading} />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Recent Activity */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Activity</Typography>
                        <List>
                            {isLoading ? [...Array(5)].map((_, i) => (
                                <ListItem key={i} disableGutters><Skeleton variant="text" width="80%" height={40} /></ListItem>
                            )) : (
                                dashboardData?.recentActivity?.quizzes.map(quiz => (
                                    <ListItem key={quiz.timestamp} disableGutters>
                                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}><QuizIcon /></Avatar>
                                        <ListItemText
                                            primary={`Quiz on "${quiz.topicId.replace(/-/g, ' ')}" completed`}
                                            secondary={`Score: ${quiz.percentage}% ・ ${formatDistanceToNow(new Date(quiz.timestamp), { addSuffix: true })}`}
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} lg={4}>
                    {/* Site Status */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Site Status</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography>Maintenance Mode</Typography>
                            <Switch
                                checked={dashboardData?.isMaintenanceMode || false}
                                onChange={toggleMaintenanceMode}
                                disabled={isLoading}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default GeneralSettingsPage;