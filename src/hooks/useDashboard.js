// src/hooks/useDashboard.js
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { subDays, format, startOfDay, parseISO, isValid, eachDayOfInterval, min } from 'date-fns';
import { alpha } from '@mui/material/styles';
import apiClient from '../api/axiosInstance';
import { generateDashboardPdfReport } from '../utils/reportGenerator';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to get the current user

const timeFrequencyOptions = [
  { value: 7, label: 'Last 7 Days' },
  { value: 30, label: 'Last 30 Days' },
  { value: 90, label: 'Last 90 Days' },
  { value: 365, label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

export const useDashboard = () => {
  const theme = useTheme();
  const { currentUser } = useAuth(); // Get the logged-in user from the context

  // --- State for Data Fetching ---
  const [userResults, setUserResults] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');

  // --- State for UI Controls ---
  const [timeFrequency, setTimeFrequency] = useState(30);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // --- Refs for PDF Generation ---
  const activityChartRef = useRef(null);
  const subjectAveragesChartRef = useRef(null);
  const topicPerformanceRef = useRef(null);

  // --- Data Fetching Logic (Now correctly authenticated) ---
  const fetchDashboardData = useCallback(async () => {
    if (!currentUser) {
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    setError('');

    try {
      // The axios interceptor automatically adds the JWT auth header to these requests.
      const [resultsRes, subjectsRes, topicsRes] = await Promise.all([
        apiClient.get('/api/results'),
        apiClient.get('/api/subjects'),
        apiClient.get('/api/topics')
      ]);

      setUserResults((resultsRes.data || []).map(r => ({ ...r, percentage: parseFloat(r.percentage) })).filter(r => !isNaN(r.percentage)));
      setAllSubjects(subjectsRes.data || []);
      setAllTopics(topicsRes.data || []);

    } catch (err) {
      setError(`Failed to load dashboard data: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- Memoized Data Processing ---
  const processedStats = useMemo(() => {
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
          average: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
          name: subj.name, color: subj.accentColor || theme.palette.grey[500]
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
      const topicsForSelectedSubject = allTopics.filter(t => t.subject_id === selectedSubject);
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

  const subjectAverageScoreChartOptions = useMemo(() => ({
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
      topicPerformanceElement: topicPerformanceRef.current, // <-- PASS THE NEW REF'S CURRENT VALUE
      isSubjectSelected: selectedSubject !== 'all', // <-- Pass a flag
      timeFrequencyLabel: timeFreqOption ? timeFreqOption.label : String(timeFrequency),
    });
    setIsGeneratingPdf(false);
  };
  
  return {
    userResults, allSubjects, isLoadingData, error, timeFrequency, selectedSubject,
    isGeneratingPdf, processedStats, subjectAverageScoreChartOptions,
    activityChartRef, subjectAveragesChartRef, topicPerformanceRef,
    fetchDashboardData, handleTimeFrequencyChange, handleSubjectChange, handleGenerateReport,
  };
};