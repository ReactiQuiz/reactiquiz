// src/pages/DashboardPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Paper, Typography, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import { motion } from 'framer-motion';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, Title, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import apiClient from '../api/axiosInstance';
import { subDays, parseISO, isValid, eachDayOfInterval, format } from 'date-fns';
import ExpandedCardPortal from '../components/dashboard/ExpandedCardPortal';

const Glass = styled(Paper)(({ theme }) => ({
  backdropFilter: 'blur(8px)',
  background: alpha(theme.palette.background.paper, 0.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  borderRadius: 16,
}));

const Card = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2.5),
  background: theme.palette.background.paper,
  transition: 'transform 180ms ease, box-shadow 180ms ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 30px ${alpha('#000', 0.22)}`,
  }
}));

const CountUpNumber: React.FC<{ end: number; duration?: number; sx?: any; variant?: any }> = ({ end, duration = 1200, sx, variant = 'h2' }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number | null = null;
    let start: number | null = null;
    const step = (t: number) => {
      if (start == null) start = t;
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.round(p * end));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [end, duration]);
  // @ts-ignore - variant typed any for brevity
  return <Typography variant={variant} sx={sx}>{val}</Typography>;
};

ChartJS.register(RadialLinearScale, PointElement, LineElement, ArcElement, Filler, ChartTooltip, Legend, CategoryScale, LinearScale, Title);

type TimeFilter = 'week' | 'month' | 'quarter' | 'year' | 'all';

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [results, setResults] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        setIsLoading(true);
        const [resRes, subRes, topRes] = await Promise.all([
          apiClient.get('/api/results'),
          apiClient.get('/api/subjects'),
          apiClient.get('/api/topics'),
        ]);
        if (canceled) return;
        const mapped = (resRes.data || []).map((r: any) => {
          const pct = Number(r.percentage) || 0;
          const tq = Number(r.totalQuestions) || 0;
          const fallbackCorrect = Math.max(0, Math.min(tq, Math.round((pct / 100) * tq)));
          const corr = r.correctAnswers != null ? Number(r.correctAnswers) : (r.score != null ? Number(r.score) : fallbackCorrect);
          return {
            ...r,
            percentage: pct,
            totalQuestions: tq,
            correctAnswers: corr,
          };
        });
        setResults(mapped);
        setSubjects(subRes.data || []);
        setTopics(topRes.data || []);
        // Debug raw
        console.log('[Dashboard] fetched results', mapped);
        console.log('[Dashboard] fetched subjects', subRes.data);
        console.log('[Dashboard] fetched topics', topRes.data);
      } catch (e) {
        console.error('[Dashboard] fetch error', e);
      } finally {
        if (!canceled) setIsLoading(false);
      }
    })();
    return () => { canceled = true; };
  }, []);

  const data = useMemo(() => {
    if (!results.length || !subjects.length) return null;
    const now = new Date();
    let start: Date | null = null;
    if (timeFilter === 'week') start = subDays(now, 7);
    else if (timeFilter === 'month') start = subDays(now, 30);
    else if (timeFilter === 'quarter') start = subDays(now, 90);
    else if (timeFilter === 'year') start = subDays(now, 365);

    let filtered = results.filter(r => {
      const d = parseISO(r.timestamp);
      if (!isValid(d)) return false;
      return start ? d >= start : true;
    });
    if (subjectFilter !== 'all') filtered = filtered.filter(r => r.subject === subjectFilter);

    const totalQuizzes = filtered.length;
    const overallAverageScore = totalQuizzes ? Number((filtered.reduce((s, r) => s + (r.percentage || 0), 0) / totalQuizzes).toFixed(1)) : 0;
    const totalQuestions = filtered.reduce((s, r) => s + (r.totalQuestions || 0), 0);
    const correctAnswers = filtered.reduce((s, r) => s + (r.correctAnswers || 0), 0);
    const accuracy = totalQuestions ? Number(((correctAnswers / totalQuestions) * 100).toFixed(1)) : 0;

    const subjectBreakdowns: Record<string, { name: string; count: number; average: number; totalQuestions: number; totalCorrect: number }> = {};
    filtered.forEach(r => {
      const key = r.subject;
      if (!subjectBreakdowns[key]) subjectBreakdowns[key] = { name: key, count: 0, average: 0, totalQuestions: 0, totalCorrect: 0 };
      subjectBreakdowns[key].count += 1;
      subjectBreakdowns[key].totalQuestions += r.totalQuestions || 0;
      subjectBreakdowns[key].totalCorrect += r.correctAnswers || 0;
    });
    Object.keys(subjectBreakdowns).forEach(key => {
      const arr = filtered.filter(r => r.subject === key);
      subjectBreakdowns[key].average = arr.length ? Number((arr.reduce((s, r) => s + (r.percentage || 0), 0) / arr.length).toFixed(1)) : 0;
    });

    const buckets = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
    filtered.forEach(r => {
      // Classify by performance tier (not quiz difficulty), ensures consistent bins
      const d = r.percentage < 50 ? 'easy' : (r.percentage < 80 ? 'medium' : 'hard');
      if (d === 'easy') { buckets.easy.total += r.totalQuestions || 0; buckets.easy.correct += r.correctAnswers || 0; }
      else if (d === 'medium') { buckets.medium.total += r.totalQuestions || 0; buckets.medium.correct += r.correctAnswers || 0; }
      else { buckets.hard.total += r.totalQuestions || 0; buckets.hard.correct += r.correctAnswers || 0; }
    });
    const pct = (c: number, t: number) => (t ? Number(((c / t) * 100).toFixed(1)) : 0);
    const overallDifficultyPerformance = {
      easy: { correct: buckets.easy.correct, total: buckets.easy.total, percentage: pct(buckets.easy.correct, buckets.easy.total) },
      medium: { correct: buckets.medium.correct, total: buckets.medium.total, percentage: pct(buckets.medium.correct, buckets.medium.total) },
      hard: { correct: buckets.hard.correct, total: buckets.hard.total, percentage: pct(buckets.hard.correct, buckets.hard.total) },
    };

    const chartDifficultyBySubject: Array<{ subject: string; easyPercent: number; mediumPercent: number; hardPercent: number; easyCount: number; mediumCount: number; hardCount: number; total: number; avg: number }> = [];
    const subjectDifficultyPerformance: any = {};
    Object.keys(subjectBreakdowns).forEach(key => {
      const arr = filtered.filter(r => r.subject === key);
      const b = { easy: { c: 0, t: 0 }, medium: { c: 0, t: 0 }, hard: { c: 0, t: 0 } };
      arr.forEach(r => {
        const d = r.percentage < 50 ? 'easy' : (r.percentage < 80 ? 'medium' : 'hard');
        if (d === 'easy') { b.easy.t += r.totalQuestions || 0; b.easy.c += r.correctAnswers || 0; }
        else if (d === 'medium') { b.medium.t += r.totalQuestions || 0; b.medium.c += r.correctAnswers || 0; }
        else { b.hard.t += r.totalQuestions || 0; b.hard.c += r.correctAnswers || 0; }
      });
      const easyP = pct(b.easy.c, b.easy.t);
      const medP = pct(b.medium.c, b.medium.t);
      const hardP = pct(b.hard.c, b.hard.t);
      subjectDifficultyPerformance[key] = {
        easy: { correct: b.easy.c, total: b.easy.t, percentage: easyP },
        medium: { correct: b.medium.c, total: b.medium.t, percentage: medP },
        hard: { correct: b.hard.c, total: b.hard.t, percentage: hardP },
      };
      chartDifficultyBySubject.push({
        subject: key,
        easyPercent: easyP,
        mediumPercent: medP,
        hardPercent: hardP,
        easyCount: b.easy.c,
        mediumCount: b.medium.c,
        hardCount: b.hard.c,
        total: b.easy.t + b.medium.t + b.hard.t,
        avg: subjectBreakdowns[key].average,
      });
    });

    const days = eachDayOfInterval({ start: subDays(new Date(), 30), end: new Date() });
    const rollingAverageData = days.map(d => {
      const day = format(d, 'yyyy-MM-dd');
      const dayArr = filtered.filter(r => format(parseISO(r.timestamp), 'yyyy-MM-dd') === day);
      const avg = dayArr.length ? Number((dayArr.reduce((s, r) => s + (r.percentage || 0), 0) / dayArr.length).toFixed(1)) : 0;
      return { date: day, averageScore: avg };
    });

    const computed = {
      totalQuizzes,
      overallAverageScore,
      overallQuestionStats: { total: totalQuestions, correct: correctAnswers, accuracy },
      subjectBreakdowns,
      subjectDifficultyPerformance,
      overallDifficultyPerformance,
      rollingAverageData,
      chartDifficultyBySubject,
      availableSubjects: ['all', ...Array.from(new Set(results.map(r => r.subject)))],
    };
    // Debug computed
    console.log('[Dashboard] computed', computed);
    return computed;
  }, [results, subjects, timeFilter, subjectFilter]);

  const availableSubjects = data?.availableSubjects || ['all'];
  const subjectKeys = data ? Object.keys(data.subjectBreakdowns) : [];

  const lineData = data ? {
    labels: data.rollingAverageData.map(d => d.date.slice(5)),
    datasets: [{
      label: 'Avg %',
      data: data.rollingAverageData.map(d => d.averageScore),
      fill: true,
      borderColor: '#7aa2f7',
      backgroundColor: '#7aa2f722',
      tension: 0.35,
      pointRadius: 2,
      pointHoverRadius: 5,
    }]
  } : { labels: [], datasets: [] };

  const donutData = data ? {
    labels: ['Score', 'Remaining'],
    datasets: [{
      data: [Math.max(0, Math.min(100, data.overallAverageScore)), Math.max(0, 100 - data.overallAverageScore)],
      backgroundColor: ['#7dcfff', alpha('#7dcfff', 0.12)],
      borderWidth: 0,
      cutout: '72%',
    }]
  } : { labels: [], datasets: [] };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, width: '100%' }}>
      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {/* Filters Bar */}
      <Glass
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          display: 'flex',
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, flexShrink: 0 }}>📊 Dashboard Summary</Typography>
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, width: { xs: '100%', sm: 'auto' }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <FormControl size="small" fullWidth sx={{ minWidth: { xs: '100%', sm: 140 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }}>
            <InputLabel>Time Period</InputLabel>
            <Select label="Time Period" value={timeFilter} onChange={e => setTimeFilter(e.target.value as any)}>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last 90 Days</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth sx={{ minWidth: { xs: '100%', sm: 160 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }}>
            <InputLabel>Subject</InputLabel>
            <Select label="Subject" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
              {availableSubjects.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Glass>

      {/* Top Row - Overview */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total Quizzes Solved</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <CountUpNumber end={data?.totalQuizzes ?? 0} variant="h2" sx={{ fontWeight: 800 }} />
              </Box>
            </Card>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Overall Average Score</Typography>
              <Box sx={{ position: 'relative', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: 140, height: 140 }}>
                  <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
                </Box>
                <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                  <CountUpNumber end={Math.round(data?.overallAverageScore || 0)} variant="h3" sx={{ fontWeight: 800 }} />
                  <Typography variant="caption" color="text.secondary">{data ? `${data.overallQuestionStats.correct} correct of ${data.overallQuestionStats.total}` : ''}</Typography>
                </Box>
              </Box>
            </Card>
          </Box>
              </Grid>
        <Grid item xs={12} md={4}>
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Correct Answers by Difficulty</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 52px', rowGap: 1, alignItems: 'center' }}>
              {(['easy','medium','hard'] as const).map(k => (
                <React.Fragment key={k}>
                  <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{k}</Typography>
                  <Box sx={{ height: 8, borderRadius: 999, background: theme => alpha(theme.palette.primary.main, 0.15), overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${data ? data.overallDifficultyPerformance[k].percentage : 0}%`, background: t => t.palette.primary.main }} />
                  </Box>
                  <Typography variant="caption">{data ? data.overallDifficultyPerformance[k].percentage : 0}%</Typography>
                </React.Fragment>
              ))}
            </Box>
            </Card>
          </Box>
            </Grid>
        </Grid>

      {/* Subject tiles carousel */}
      {data && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>🧠 Subject-Wise Performance</Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, pr: 1 }}>
            {Object.keys(data.subjectBreakdowns).map((key, idx) => {
              const sb = data.subjectBreakdowns[key];
              const perf = data.subjectDifficultyPerformance[key];
              const colors = ['#7dcfff', '#bb9af7', '#a6e3a1', '#f7768e', '#e0af68', '#7aa2f7'];
              const c = colors[idx % colors.length];
              return (
                <Box component={motion.div}
                  key={key}
                  whileHover={{ scale: 1.03 }}
                  sx={{ minWidth: { xs: 180, sm: 240 } }}
                  onClick={() => setExpandedSubject(sb.name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') setExpandedSubject(sb.name); }}
                >
                  <Card sx={{ borderTop: `3px solid ${c}` }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: c, mb: 1 }}>{sb.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>{sb.average}% avg • {sb.count} quiz(zes)</Typography>
                  {(['easy','medium','hard'] as const).map((k, i) => (
                    <Box key={k} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{k}</Typography>
                        <Typography variant="caption">{perf?.[k].percentage || 0}%</Typography>
                      </Box>
                      <Box sx={{ height: 8, borderRadius: 999, background: theme => alpha(theme.palette.text.disabled, 0.15), overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${perf?.[k].percentage || 0}%`, background: c }} />
                      </Box>
                    </Box>
                  ))}
                  </Card>
                </Box>
              );
            })}
          </Box>
            </Box>
      )}

      {/* Bottom charts */}
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={7} lg={8}>
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>⚡ Difficulty Analysis</Typography>
            {data && subjectKeys.length > 0 ? (
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '140px 1fr 100px' }, rowGap: 2, alignItems: 'center' }}>
                    {/* Header Row */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ width: 12, height: 6, background: '#22c55e', borderRadius: 999 }} />
                      <Typography variant="caption" color="text.secondary">Easy</Typography>
                      <Box sx={{ width: 12, height: 6, background: '#f59e0b', borderRadius: 999, ml: { xs: 0, sm: 1 } }} />
                      <Typography variant="caption" color="text.secondary">Medium</Typography>
                      <Box sx={{ width: 12, height: 6, background: '#ef4444', borderRadius: 999, ml: { xs: 0, sm: 1 } }} />
                      <Typography variant="caption" color="text.secondary">Hard</Typography>
                    </Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
                    {data.chartDifficultyBySubject.map((row, idx) => (
                      <React.Fragment key={row.subject}>
                        <Typography variant="body2" sx={{ fontWeight: 600, pr: { xs: 0, sm: 2 } }}>{row.subject}</Typography>
                        <Box sx={{ height: 12, borderRadius: 999, display: 'flex', overflow: 'hidden', background: theme => alpha(theme.palette.text.disabled, 0.15) }}>
                          <Box component={motion.div} initial={{ width: 0 }} whileInView={{ width: `${row.easyPercent}%` }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.03 }} title={`Easy ${row.easyPercent}%`} sx={{ height: '100%', background: '#22c55e' }} />
                          <Box component={motion.div} initial={{ width: 0 }} whileInView={{ width: `${row.mediumPercent}%` }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.03 + 0.05 }} title={`Med ${row.mediumPercent}%`} sx={{ height: '100%', background: '#f59e0b' }} />
                          <Box component={motion.div} initial={{ width: 0 }} whileInView={{ width: `${row.hardPercent}%` }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.03 + 0.1 }} title={`Hard ${row.hardPercent}%`} sx={{ height: '100%', background: '#ef4444' }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: { xs: 0.5, sm: 0 } }}>Total: {row.total} • Avg: {row.avg}%</Typography>
                      </React.Fragment>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">No data</Typography>
              )}
            </Card>
          </Box>
        </Grid>
        <Grid item xs={12} md={5}>
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ p: { xs: 1.5, sm: 2.5 }, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>📈 30-Day Performance Trend</Typography>
              {data ? <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, max: 100 } } }} /> : <Typography variant="caption" color="text.secondary">No data</Typography>}
            </Card>
          </Box>
        </Grid>
        </Grid>

      {/* Expanded Subject Portal */}
      <ExpandedCardPortal open={!!expandedSubject} onClose={() => setExpandedSubject(null)}>
        {expandedSubject && data && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{expandedSubject} — Details</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {data.subjectBreakdowns[expandedSubject]?.count || 0} quizzes • {data.subjectBreakdowns[expandedSubject]?.average || 0}% average
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px', rowGap: 1.5, alignItems: 'center' }}>
              {(['easy','medium','hard'] as const).map(k => {
                const perf = data.subjectDifficultyPerformance[expandedSubject]?.[k];
                const color = k === 'easy' ? '#22c55e' : k === 'medium' ? '#f59e0b' : '#ef4444';
                return (
                  <React.Fragment key={k}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{k}</Typography>
                    <Box sx={{ height: 12, borderRadius: 999, display: 'flex', overflow: 'hidden', background: theme => alpha(theme.palette.text.disabled, 0.15) }}>
                      <Box sx={{ width: `${perf?.percentage || 0}%`, background: color }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">{perf?.correct || 0} / {perf?.total || 0} • {perf?.percentage || 0}%</Typography>
                  </React.Fragment>
                );
              })}
            </Box>
          </Box>
        )}
      </ExpandedCardPortal>

      {/* Floating settings */}
      <Tooltip title="Settings" placement="left">
        <IconButton color="primary" sx={{ position: 'fixed', right: 16, bottom: 16, backdropFilter: 'blur(6px)', background: theme => alpha(theme.palette.background.paper, 0.6) }}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}


