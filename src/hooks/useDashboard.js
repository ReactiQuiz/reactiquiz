// src/hooks/useDashboard.js
import { useState, useMemo, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { subDays, format, startOfDay, parseISO, isValid, eachDayOfInterval, min } from 'date-fns';
import { alpha } from '@mui/material/styles';
import apiClient from '../api/axiosInstance';
import { generateDashboardPdfReport } from '../utils/reportGenerator';
import { useAuth } from '../contexts/AuthContext';
import { useSubjectColors } from '../contexts/SubjectColorsContext';
import { useQueries } from '@tanstack/react-query';

const timeFrequencyOptions = [
  { value: 7, label: 'Last 7 Days' },
  { value: 30, label: 'Last 30 Days' },
  { value: 90, label: 'Last 90 Days' },
  { value: 365, label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

// --- Fetcher Functions ---
const fetchUserResults = async () => {
  const { data } = await apiClient.get('/api/results');
  return data || [];
};
const fetchAllSubjects = async () => {
  const { data } = await apiClient.get('/api/subjects');
  return data || [];
};
const fetchAllTopics = async () => {
  const { data } = await apiClient.get('/api/topics');
  return data || [];
};

export const useDashboard = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const { getColor } = useSubjectColors();

  // --- UI State and Refs ---
  const [timeFrequency, setTimeFrequency] = useState(30);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const activityChartRef = useRef(null);
  const subjectAveragesChartRef = useRef(null);
  const topicPerformanceRef = useRef(null);

  // --- Data Fetching with useQueries ---
  const results = useQueries({
    queries: [
      { queryKey: ['userResults', currentUser?.id], queryFn: fetchUserResults, enabled: !!currentUser },
      { queryKey: ['subjects'], queryFn: fetchAllSubjects },
      { queryKey: ['topics'], queryFn: fetchAllTopics },
    ]
  });

  const isLoadingData = results.some(query => query.isLoading);
  const isError = results.some(query => query.isError);
  const error = results.find(query => query.error)?.error;

  const userResults = results[0].data ?? [];
  const allSubjects = results[1].data ?? [];
  const allTopics = results[2].data ?? [];

  // --- Memoized Data Processing (this logic remains the same) ---
  const processedStats = useMemo(() => {
    // ... [ The entire, large useMemo block from your original file goes here. It is unchanged. ]
    if (userResults.length === 0 || allSubjects.length === 0) {
      return { filteredResults: [], totalQuizzes: 0, overallAverageScore: 0, subjectStats: {}, activityData: { labels: [], datasets: [] }, subjectAverageScoreChartData: { labels: [], datasets: [] }, bestSubject: null, weakestSubject: null, topicPerformance: [] };
    }

    const today = startOfDay(new Date());
    const validDates = userResults.map(r => parseISO(r.timestamp)).filter(isValid);
    const startDate = timeFrequency === 'all'
      ? (validDates.length > 0 ? startOfDay(min(validDates)) : today)
      : startOfDay(subDays(today, Number(timeFrequency) - 1));

    let resultsInTimePeriod = userResults.filter(r => {
      const resultDate = parseISO(r.timestamp);
      return isValid(resultDate) && resultDate >= startDate && resultDate <= today;
    });

    const filteredResults = selectedSubject === 'all'
      ? resultsInTimePeriod
      : resultsInTimePeriod.filter(r => r.subject?.toLowerCase() === selectedSubject.toLowerCase());

    const subjectStats = {};
    allSubjects.forEach(subj => {
      const keyLower = subj.subjectKey.toLowerCase();
      const results = resultsInTimePeriod.filter(r => r.subject?.toLowerCase() === keyLower);
      if (results.length > 0) {
        const percentages = results.map(r => r.percentage);
        subjectStats[keyLower] = {
          count: results.length,
          average: Math.round(results.map(r => r.percentage).reduce((a, b) => a + b, 0) / results.length),
          name: subj.name,
          color: getColor(subj.subjectKey)
        };
      }
    });

    let bestSubject = null, weakestSubject = null;
    const subjectsWithStats = Object.values(subjectStats);
    if (subjectsWithStats.length > 0) {
      bestSubject = [...subjectsWithStats].sort((a, b) => b.average - a.average)[0];
      weakestSubject = [...subjectsWithStats].sort((a, b) => a.average - b.average)[0];
      if (bestSubject === weakestSubject) weakestSubject = null;
    }

    let topicPerformance = [];
    if (selectedSubject !== 'all' && allTopics.length > 0) {
      const topicsForSelectedSubject = allTopics.filter(t => t.subject_id === allSubjects.find(s => s.subjectKey === selectedSubject)?.id);
      topicPerformance = topicsForSelectedSubject.map(topic => {
        const topicResults = filteredResults.filter(r => r.topicId === topic.id);
        if (topicResults.length > 0) {
          const avgScore = Math.round(topicResults.reduce((acc, r) => acc + r.percentage, 0) / topicResults.length);
          return { id: topic.id, name: topic.name, count: topicResults.length, average: avgScore };
        }
        return null;
      }).filter(Boolean).sort((a, b) => b.average - a.average);
    }

    const totalQuizzes = filteredResults.length;
    const overallAverageScore = totalQuizzes > 0 ? Math.round(filteredResults.reduce((acc, r) => acc + r.percentage, 0) / totalQuizzes) : 0;

    const activityCounts = {};
    filteredResults.forEach(r => {
      const dayKey = format(startOfDay(parseISO(r.timestamp)), 'yyyy-MM-dd');
      activityCounts[dayKey] = (activityCounts[dayKey] || 0) + 1;
    });
    const chartLabels = eachDayOfInterval({ start: startDate, end: today }).map(d => format(d, 'yyyy-MM-dd'));
    const activityData = {
      labels: chartLabels,
      datasets: [{
        label: 'Quizzes Taken', data: chartLabels.map(day => activityCounts[day] || 0), fill: true,
        backgroundColor: alpha(theme.palette.primary.main, 0.3), borderColor: theme.palette.primary.main, tension: 0.1,
      }],
    };

    const subjectAverageScoreChartData = {
      labels: Object.values(subjectStats).map(s => s.name),
      datasets: [{
        label: 'Average Score (%)', data: Object.values(subjectStats).map(s => s.average),
        backgroundColor: Object.values(subjectStats).map(s => alpha(s.color, 0.7)),
        borderColor: Object.values(subjectStats).map(s => s.color), borderWidth: 1,
      }],
    };

    return { filteredResults, totalQuizzes, overallAverageScore, subjectStats, activityData, subjectAverageScoreChartData, bestSubject, weakestSubject, topicPerformance };

  }, [userResults, allSubjects, allTopics, timeFrequency, selectedSubject, theme]);

  // --- Chart Options and Handlers (these are unchanged) ---
  const subjectAverageScoreChartOptions = useMemo(() => ({
    // ... [ Unchanged chart options block ]
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false }, tooltip: { callbacks: { label: (c) => `Average: ${c.parsed.x}%` } } },
    scales: {
      x: { beginAtZero: true, max: 100, ticks: { color: theme.palette.text.secondary, callback: (v) => v + "%" }, grid: { color: alpha(theme.palette.text.secondary, 0.1) }, title: { display: true, text: 'Average Score (%)', color: theme.palette.text.secondary } },
      y: { ticks: { color: theme.palette.text.secondary }, grid: { display: false } }
    }
  }), [theme.palette.text.secondary]);

  const handleTimeFrequencyChange = (event) => setTimeFrequency(event.target.value);
  const handleSubjectChange = (event) => setSelectedSubject(event.target.value);
  const handleGenerateReport = async () => {
    // ... [ Unchanged report generation logic ]
    setIsGeneratingPdf(true);
    const timeFreqOption = timeFrequencyOptions.find(opt => opt.value === timeFrequency);

    await generateDashboardPdfReport({
      currentUser: currentUser,
      overallStats: {
        totalQuizzes: processedStats.totalQuizzes,
        overallAverageScore: processedStats.overallAverageScore,
      },
      activityChartElement: activityChartRef.current,
      subjectAveragesChartElement: subjectAveragesChartRef.current,
      topicPerformanceElement: topicPerformanceRef.current,
      isSubjectSelected: selectedSubject !== 'all',
      timeFrequencyLabel: timeFreqOption ? timeFreqOption.label : String(timeFrequency),
    });
    setIsGeneratingPdf(false);
  };

  return {
    allSubjects,
    isLoadingData,
    error: isError ? error.message : null,
    timeFrequency, selectedSubject, isGeneratingPdf, processedStats,
    subjectAverageScoreChartOptions, activityChartRef,
    subjectAveragesChartRef, topicPerformanceRef, handleTimeFrequencyChange,
    handleSubjectChange, handleGenerateReport,
  };
};