// src/components/admin/ContentOverview.tsx
/**
 * Content Overview Component
 * 
 * This component displays an overview of content statistics in the admin panel.
 * It shows total counts for subjects, topics, and questions, as well as
 * a breakdown by subject.
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Alert, Skeleton, Grid, Divider
} from '@mui/material';
import apiClient from '../../api/axiosInstance';

/**
 * TotalStatCardProps Interface
 * 
 * Props for the TotalStatCard component.
 */
interface TotalStatCardProps {
  title: string; // Title text for the stat card
  value: number; // Numeric value to display
  isLoading: boolean; // Whether data is loading
}

/**
 * SubjectBreakdownCardProps Interface
 * 
 * Props for the SubjectBreakdownCard component.
 */
interface SubjectBreakdownCardProps {
  subject?: { // Optional subject data
    name: string; // Subject name
    color: string; // Subject accent color
    topicCount: number; // Number of topics
    questionCount: number; // Number of questions
    subjectKey: string; // Subject key identifier
  };
  isLoading: boolean; // Whether data is loading
}

/**
 * Total Stat Card Component
 * 
 * Displays a large stat card for main totals.
 * Features:
 * - Large value display (with number formatting)
 * - Title text
 * - Loading skeleton state
 * 
 * @param {TotalStatCardProps} props - Component props
 * @returns {JSX.Element} Total stat card
 */
const TotalStatCard: React.FC<TotalStatCardProps> = ({ title, value, isLoading }) => (
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

/**
 * Subject Breakdown Card Component
 * 
 * Displays a smaller card for subject breakdown.
 * Features:
 * - Subject name with accent color
 * - Topic count
 * - Question count
 * - Colored left border
 * - Loading skeleton state
 * 
 * @param {SubjectBreakdownCardProps} props - Component props
 * @returns {JSX.Element} Subject breakdown card
 */
const SubjectBreakdownCard: React.FC<SubjectBreakdownCardProps> = ({ subject, isLoading }) => (
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

/**
 * Stats Interface
 * 
 * Statistics data structure returned from the API.
 */
interface Stats {
  totalSubjects: number; // Total number of subjects
  totalTopics: number; // Total number of topics
  totalQuestions: number; // Total number of questions
  subjectBreakdown: SubjectBreakdownCardProps['subject'][]; // Array of subject breakdown data
}

/**
 * Content Overview Component
 * 
 * Displays an overview of content statistics with:
 * - Main totals section (Subjects, Topics, Questions)
 * - Subject breakdown section (grid of subject cards)
 * - Loading states
 * - Error handling
 * - API integration for fetching stats
 * 
 * This component is used on the admin Content page to display
 * content statistics and breakdowns.
 * 
 * @returns {JSX.Element} Content overview with statistics
 */
const ContentOverview: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
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
                            <SubjectBreakdownCard subject={undefined} isLoading={true} />
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