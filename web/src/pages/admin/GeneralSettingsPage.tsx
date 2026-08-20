// src/pages/admin/GeneralSettingsPage.tsx
/**
 * General Settings Page (Admin Command Center)
 * 
 * Command-Center dashboard featuring:
 * - Real-time Database KPI Metric Cards (Users, Topics, Questions, Chapter Notes)
 * - Quick Launch Action shortcuts directly to Content & User management
 * - System health and database connectivity status
 */

import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Alert, Skeleton,
  Card, CardActionArea, Chip, useTheme, alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StorageIcon from '@mui/icons-material/Storage';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import apiClient from '../../api/axiosInstance';

interface KpiCardProps {
  title: string;
  value?: number;
  icon: React.ReactNode;
  accentColor: string;
  subtitle: string;
  isLoading: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  accentColor,
  subtitle,
  isLoading,
}) => {
  const theme = useTheme();

  return (
    <Grid item xs={12} sm={6} lg={3}>
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 200ms ease',
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: alpha(accentColor, 0.6),
            boxShadow: (t) => t.palette.mode === 'dark'
              ? `0 12px 24px -10px ${alpha(accentColor, 0.3)}`
              : `0 12px 24px -10px ${alpha(accentColor, 0.15)}`,
          },
        }}
      >
        {/* Subtle top accent gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.3)})`,
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.75rem' }}>
            {title}
          </Typography>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(accentColor, 0.12),
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>

        {isLoading ? (
          <Skeleton variant="text" width={100} height={48} />
        ) : (
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            {typeof value === 'number' ? value.toLocaleString() : '0'}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 500 }}>
          {subtitle}
        </Typography>
      </Paper>
    </Grid>
  );
};

function GeneralSettingsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchAdminStats = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/api/admin/status', {
          signal: controller.signal,
        });
        setStats(response.data);
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          setError(err.response?.data?.message || 'An error occurred while fetching dashboard metrics.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Top Banner Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', sm: '2.4rem' }, fontWeight: 800 }}>
              Command Center
            </Typography>
            <Chip
              icon={<ShieldOutlinedIcon sx={{ fontSize: '0.9rem !important' }} />}
              label="Admin Active"
              color="primary"
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            System health, real-time database metrics, and quick administrative workflows.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, px: 2, borderRadius: 2, bgcolor: (t) => alpha(t.palette.text.primary, 0.03), border: (t) => `1px solid ${t.palette.divider}` }}>
          <StorageIcon fontSize="small" sx={{ color: '#22C55E' }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Turso Primary Engine: <Typography component="span" variant="caption" sx={{ color: '#22C55E', fontWeight: 700 }}>Operational</Typography>
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* KPI Metric Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <KpiCard
          title="Registered Users"
          value={stats?.userCount}
          icon={<PeopleAltOutlinedIcon />}
          accentColor="#38BDF8"
          subtitle="Total accounts in database"
          isLoading={isLoading}
        />
        <KpiCard
          title="Quiz Topics"
          value={stats?.topicCount}
          icon={<FolderCopyOutlinedIcon />}
          accentColor="#A855F7"
          subtitle="Active curriculum chapters"
          isLoading={isLoading}
        />
        <KpiCard
          title="Total Questions"
          value={stats?.questionCount}
          icon={<QuizOutlinedIcon />}
          accentColor="#F59E0B"
          subtitle="Indexed questions across all topics"
          isLoading={isLoading}
        />
        <KpiCard
          title="Chapter Notes"
          value={stats?.noteCount}
          icon={<MenuBookOutlinedIcon />}
          accentColor="#10B981"
          subtitle="Ready-made Markdown study guides"
          isLoading={isLoading}
        />
      </Grid>

      {/* Quick Launch Action Shortcuts */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Administrative Workflows
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%', transition: 'all 150ms ease', '&:hover': { borderColor: 'primary.main' } }}>
            <CardActionArea onClick={() => navigate('/admin/content')} sx={{ p: 2.5, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  Chapter Notes Studio
                </Typography>
                <ArrowForwardIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Author & live-preview Markdown study notes with formulas, Mermaid diagrams, and SVGs.
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%', transition: 'all 150ms ease', '&:hover': { borderColor: 'primary.main' } }}>
            <CardActionArea onClick={() => navigate('/admin/content')} sx={{ p: 2.5, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  Questions CMS
                </Typography>
                <ArrowForwardIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage questions by topic, upload high-volume 500k-line JSONs, or edit directly.
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%', transition: 'all 150ms ease', '&:hover': { borderColor: 'primary.main' } }}>
            <CardActionArea onClick={() => navigate('/admin/content')} sx={{ p: 2.5, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  Subjects & Topics
                </Typography>
                <ArrowForwardIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Configure curriculum subjects, database accent colors, display orders, and topic slugs.
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%', transition: 'all 150ms ease', '&:hover': { borderColor: 'primary.main' } }}>
            <CardActionArea onClick={() => navigate('/admin/users')} sx={{ p: 2.5, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  User Management
                </Typography>
                <ArrowForwardIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Search student accounts, view classes, and manage administrator access permissions.
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default GeneralSettingsPage;