// src/hooks/useDashboard.js
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { subDays, format, startOfDay, parseISO, isValid, eachDayOfInterval, min } from 'date-fns';
import { alpha } from '@mui/material/styles';
import apiClient from '../api/axiosInstance';
import { generateDashboardPdfReport } from '../utils/reportGenerator';

const timeFrequencyOptions = [
  { value: 7, label: 'Last 7 Days' },
  { value: 30, label: 'Last 30 Days' },
  { value: 90, label: 'Last 90 Days' },
  { value: 365, label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

/**
 * A comprehensive custom hook to manage all state and logic for the Dashboard page.
 * @param {object | null} currentUser - The currently authenticated user object.
 * @returns {object} An object containing all the state, derived data, and handlers needed by the DashboardPage component.
 */
export const useDashboard = (currentUser) => {
  const theme = useTheme();

  // --- State for Data Fetching ---
  const [userResults, setUserResults] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');

  // --- State for UI Controls ---
  const [timeFrequency, setTimeFrequency] = useState(30);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // --- Refs for PDF Generation ---
  const activityChartRef = useRef(null);
  const subjectAveragesChartRef = useRef(null);

  // --- Data Fetching Logic ---
  const fetchDashboardData = useCallback(async () => {
    if (!currentUser || !currentUser.id) {
      setIsLoadingData(false);
      setUserResults([]);
      setAllSubjects([]);
      return;
    }
    setIsLoadingData(true);
    setError('');

    try {
      const [resultsRes, subjectsRes] = await Promise.all([
        apiClient.get(`/api/results?userId=${currentUser.id}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }),
        apiClient.get('/api/subjects'),
      ]);

      if (Array.isArray(resultsRes.data)) {
        setUserResults(
          resultsRes.data
            .map(r => ({ ...r, percentage: parseFloat(r.percentage) }))
            .filter(r => !isNaN(r.percentage))
        );
      } else {
        throw new Error('Invalid data format for results.');
      }
      
      if (Array.isArray(subjectsRes.data)) {
        setAllSubjects(subjectsRes.data);
      } else {
        throw new Error('Invalid data format for subjects.');
      }

    } catch (err) {
      setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- Memoized Data Processing ---
  const processedStats = useMemo(() => {
    if (!userResults || allSubjects.length === 0) {
      return { totalQuizzes: 0, overallAverageScore: 0, subjectStats: {}, activityData: { labels: [], datasets: [] }, subjectAverageScoreChartData: { labels: [], datasets: [] } };
    }
    const today = startOfDay(new Date());
    let startDate;
    const endDate = today;
    let resultsForPeriod = userResults;

    if (timeFrequency === 'all') {
      const allDates = userResults.map(r => parseISO(r.timestamp)).filter(isValid);
      startDate = allDates.length > 0 ? startOfDay(min(allDates)) : today;
    } else {
      startDate = startOfDay(subDays(today, Number(timeFrequency) - 1));
      resultsForPeriod = userResults.filter(r => {
        const resultDate = parseISO(r.timestamp);
        return isValid(resultDate) && resultDate >= startDate && resultDate <= endDate;
      });
    }

    const totalQuizzes = resultsForPeriod.length;
    const validPercentages = resultsForPeriod.map(r => r.percentage).filter(p => !isNaN(p));
    const overallAverageScore = validPercentages.length > 0 ? Math.round(validPercentages.reduce((acc, p) => acc + p, 0) / validPercentages.length) : 0;

    const subjectStats = {};
    allSubjects.forEach(subj => {
      const keyLower = subj.subjectKey.toLowerCase();
      const results = resultsForPeriod.filter(r => r.subject?.toLowerCase() === keyLower);
      const percentages = results.map(r => r.percentage).filter(p => !isNaN(p));
      subjectStats[keyLower] = {
        count: results.length,
        average: percentages.length > 0 ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length) : 0,
        name: subj.name,
        color: subj.accentColor || theme.palette.grey[500]
      };
    });

    const activityCounts = {};
    resultsForPeriod.forEach(r => {
      const dayKey = format(startOfDay(parseISO(r.timestamp)), 'yyyy-MM-dd');
      activityCounts[dayKey] = (activityCounts[dayKey] || 0) + 1;
    });

    const chartLabels = eachDayOfInterval({ start: startDate, end: endDate }).map(d => format(d, 'yyyy-MM-dd'));
    const activityData = {
      labels: chartLabels,
      datasets: [{
        label: 'Quizzes Taken', data: chartLabels.map(day => activityCounts[day] || 0), fill: true,
        backgroundColor: alpha(theme.palette.primary.main, 0.3), borderColor: theme.palette.primary.main, tension: 0.1,
        pointBackgroundColor: theme.palette.primary.main, pointBorderColor: theme.palette.common.white,
        pointHoverBackgroundColor: theme.palette.common.white, pointHoverBorderColor: theme.palette.primary.dark,
      }],
    };

    const statsWithData = allSubjects.map(s => subjectStats[s.subjectKey.toLowerCase()]).filter(s => s?.count > 0);
    const subjectAverageScoreChartData = {
      labels: statsWithData.map(s => s.name),
      datasets: [{
        label: 'Average Score (%)', data: statsWithData.map(s => s.average),
        backgroundColor: statsWithData.map(s => alpha(s.color, 0.7)),
        borderColor: statsWithData.map(s => s.color),
        borderWidth: 1,
      }],
    };

    return { totalQuizzes, overallAverageScore, subjectStats, activityData, subjectAverageScoreChartData };
  }, [userResults, allSubjects, timeFrequency, theme]);

  // --- Memoized Chart Options ---
  const subjectAverageScoreChartOptions = useMemo(() => ({
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false }, tooltip: { callbacks: { label: (c) => `Average: ${c.parsed.x}%` } } },
    scales: {
      x: { beginAtZero: true, max: 100, ticks: { color: theme.palette.text.secondary, callback: (v) => v + "%" }, grid: { color: alpha(theme.palette.text.secondary, 0.1) }, title: { display: true, text: 'Average Score (%)', color: theme.palette.text.secondary } },
      y: { ticks: { color: theme.palette.text.secondary }, grid: { display: false } }
    }
  }), [theme.palette.text.secondary]);

  // --- Event Handlers ---
  const handleTimeFrequencyChange = (event) => {
    setTimeFrequency(event.target.value);
  };

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
      timeFrequencyLabel: timeFreqOption ? timeFreqOption.label : String(timeFrequency),
    });
    setIsGeneratingPdf(false);
  };

  // --- Return all state and handlers needed by the component ---
  return {
    // Data and states
    userResults,
    allSubjects,
    isLoadingData,
    error,
    timeFrequency,
    isGeneratingPdf,
    processedStats,
    subjectAverageScoreChartOptions,
    // Refs
    activityChartRef,
    subjectAveragesChartRef,
    // Handlers
    fetchDashboardData,
    handleTimeFrequencyChange,
    handleGenerateReport,
  };
};