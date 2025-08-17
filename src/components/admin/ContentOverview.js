// src/components/admin/ContentOverview.js
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Alert, Skeleton, Grid, Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import apiClient from '../../api/axiosInstance';

// Big stat card for the main totals
const TotalStatCard = ({ title, value, isLoading }) => (
    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="overline" color="text.secondary">
            {title}
        </Typography>
        {isLoading ? (
            <Skeleton variant="text" width={100} height={60} sx={{ mx: 'auto' }} />
        ) : (
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {value.toLocaleString()}
            </Typography>
        )}
    </Paper>
);

// Smaller card for the breakdown by subject
const SubjectBreakdownCard = ({ subject, isLoading }) => (
    <Paper 
        variant="outlined" 
        sx={{ p: 2.5, height: '100%', borderLeft: `4px solid ${subject?.color || '#333'}` }}
    >
        {isLoading ? (
            <>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="80%" height={24} sx={{mt: 1}} />
                <Skeleton variant="text" width="70%" height={24} />
            </>
        ) : (
            <>
                <Typography variant="h6" sx={{ fontWeight: 600, color: subject.color }}>
                    {subject.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Topics: <Typography component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{subject.topicCount.toLocaleString()}</Typography>
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Questions: <Typography component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{subject.questionCount.toLocaleString()}</Typography>
                </Typography>
            </>
        )}
    </Paper>
);

function ContentOverview() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get('/api/admin/overview-stats');
                setStats(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch overview data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* --- Main Totals Section --- */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <TotalStatCard title="Total Subjects" value={stats?.totalSubjects || 0} isLoading={isLoading} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TotalStatCard title="Total Topics" value={stats?.totalTopics || 0} isLoading={isLoading} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TotalStatCard title="Total Questions" value={stats?.totalQuestions || 0} isLoading={isLoading} />
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }}>
                <Typography variant="overline">Breakdown by Subject</Typography>
            </Divider>
            
            {/* --- Subject Breakdown Section --- */}
            <Grid container spacing={3}>
                {isLoading ? (
                    Array.from(new Array(6)).map((_, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <SubjectBreakdownCard isLoading={true} />
                        </Grid>
                    ))
                ) : (
                    stats?.subjectBreakdown.map(subject => (
                        <Grid item xs={12} sm={6} md={4} key={subject.subjectKey}>
                            <SubjectBreakdownCard subject={subject} isLoading={false} />
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
}

export default ContentOverview;