// src/hooks/useDashboard.js
import { useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { subDays, format, startOfDay, parseISO, isValid, eachDayOfInterval, min } from 'date-fns';
import { alpha } from '@mui/material/styles';
import { generateDashboardPdfReport } from '../utils/reportGenerator';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useSubjectColors } from '../contexts/SubjectColorsContext';

const timeFrequencyOptions = [
  { value: 7, label: 'Last 7 Days' },
  { value: 30, label: 'Last 30 Days' },
  { value: 90, label: 'Last 90 Days' },
  { value: 365, label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

// --- Fetcher functions defined outside the hook ---
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

// New fetcher to get all questions related to a user's results
const fetchQuestionsByTopicIds = async (topicIds) => {
    if (!topicIds || topicIds.length === 0) return [];
    // A real-world app might POST the array of IDs to a dedicated endpoint,
    // but parallel GET requests work well for a moderate number of topics.
    const requests = topicIds.map(id => apiClient.get(`/api/questions?topicId=${id}`));
    const responses = await Promise.all(requests);
    return responses.flatMap(res => res.data);
};

export const useDashboard = () => {
    const theme = useTheme();
    const { currentUser } = useAuth();
    const { getColor } = useSubjectColors();

    // UI State
    const [timeFrequency, setTimeFrequency] = useState(30);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Refs for PDF generation
    const activityChartRef = useRef(null);
    const subjectAveragesChartRef = useRef(null);
    const topicPerformanceRef = useRef(null);

    // --- Data Fetching Layer ---
    const { data: userResults = [], isLoading: isLoadingResults } = useQuery({
        queryKey: ['userResults', currentUser?.id],
        queryFn: fetchUserResults,
        enabled: !!currentUser
    });

    const { data: allSubjects = [], isLoading: isLoadingSubjects } = useQuery({
        queryKey: ['subjects'],
        queryFn: fetchAllSubjects
    });
    
    const { data: allTopics = [], isLoading: isLoadingTopics } = useQuery({
        queryKey: ['topics'],
        queryFn: fetchAllTopics
    });

    // Filter results based on UI controls first
    const filteredResults = useMemo(() => {
        const today = startOfDay(new Date());
        // A large number for 'all time' to effectively mean no start date limit
        const startDate = timeFrequency === 'all' ? new Date(0) : startOfDay(subDays(today, timeFrequency));
        
        const resultsInTimePeriod = userResults.filter(r => {
            const resultDate = parseISO(r.timestamp);
            return isValid(resultDate) && resultDate >= startDate;
        });

        if (selectedSubject === 'all') {
            return resultsInTimePeriod;
        }
        return resultsInTimePeriod.filter(r => r.subject?.toLowerCase() === selectedSubject.toLowerCase());
    }, [userResults, timeFrequency, selectedSubject]);

    // Based on filtered results, get the required questions
    const uniqueTopicIdsInFilteredResults = useMemo(() => [...new Set(filteredResults.map(r => r.topicId))], [filteredResults]);

    const { data: relevantQuestions = [], isLoading: isLoadingQuestions } = useQuery({
        queryKey: ['questionsForDashboard', uniqueTopicIdsInFilteredResults],
        queryFn: () => fetchQuestionsByTopicIds(uniqueTopicIdsInFilteredResults),
        enabled: uniqueTopicIdsInFilteredResults.length > 0
    });

    // Overall loading state for the page skeleton
    const isLoadingData = isLoadingResults || isLoadingSubjects || isLoadingTopics || isLoadingQuestions;
    
    // --- Complex Data Processing Layer ---
    const processedStats = useMemo(() => {
        // Default empty state
        const defaultState = {
            totalQuizzes: 0,
            overallAverageScore: 0,
            subjectBreakdowns: {},
            difficultyPerformance: {
                easy: { average: 0, count: 0 },
                medium: { average: 0, count: 0 },
                hard: { average: 0, count: 0 }
            },
            activityData: { labels: [], datasets: [] },
            topicPerformance: []
        };
        
        if (filteredResults.length === 0 || allSubjects.length === 0) {
            return defaultState;
        }

        const questionMap = new Map(relevantQuestions.map(q => [q.id, q]));
        const difficultyStats = {
            easy: { correct: 0, total: 0 },
            medium: { correct: 0, total: 0 },
            hard: { correct: 0, total: 0 },
        };
        const subjectBreakdowns = {};

        // Calculate subject-level stats (for KPI card dropdowns)
        allSubjects.forEach(subject => {
            const resultsForSubj = filteredResults.filter(r => r.subject === subject.subjectKey);
            if (resultsForSubj.length > 0) {
                subjectBreakdowns[subject.subjectKey] = {
                    name: subject.name,
                    count: resultsForSubj.length,
                    average: Math.round(resultsForSubj.reduce((acc, r) => acc + r.percentage, 0) / resultsForSubj.length)
                };
            }
        });

        // Calculate difficulty-level stats
        for (const result of filteredResults) {
            const userAnswers = JSON.parse(result.userAnswersSnapshot || '{}');
            const attemptedIds = JSON.parse(result.questionsActuallyAttemptedIds || '[]');
            
            for (const questionId of attemptedIds) {
                const question = questionMap.get(questionId);
                if (!question) continue;

                const diff = question.difficulty;
                let diffKey = '';
                if (diff >= 18) diffKey = 'hard';
                else if (diff >= 14) diffKey = 'medium';
                else if (diff >= 10) diffKey = 'easy';
                
                if (diffKey && difficultyStats[diffKey]) {
                    difficultyStats[diffKey].total++;
                    if (userAnswers[questionId] === question.correctOptionId) {
                        difficultyStats[diffKey].correct++;
                    }
                }
            }
        }
        
        const calcAvg = (correct, total) => total > 0 ? (correct / total) * 100 : 0;
        const difficultyPerformance = {
            easy: { average: calcAvg(difficultyStats.easy.correct, difficultyStats.easy.total), count: difficultyStats.easy.total },
            medium: { average: calcAvg(difficultyStats.medium.correct, difficultyStats.medium.total), count: difficultyStats.medium.total },
            hard: { average: calcAvg(difficultyStats.hard.correct, difficultyStats.hard.total), count: difficultyStats.hard.total },
        };
        
        // Calculate activity chart data
        const today = startOfDay(new Date());
        const startDate = timeFrequency === 'all' ? (filteredResults.length > 0 ? startOfDay(min(filteredResults.map(r => parseISO(r.timestamp)))) : today) : startOfDay(subDays(today, timeFrequency));
        const activityCounts = {};
        filteredResults.forEach(r => {
            const dayKey = format(startOfDay(parseISO(r.timestamp)), 'yyyy-MM-dd');
            activityCounts[dayKey] = (activityCounts[dayKey] || 0) + 1;
        });
        const chartLabels = eachDayOfInterval({ start: startDate, end: today }).map(d => format(d, 'yyyy-MM-dd'));
        const activityData = {
            labels: chartLabels,
            datasets: [{
                label: 'Quizzes Taken',
                data: chartLabels.map(day => activityCounts[day] || 0),
                fill: true,
                backgroundColor: alpha(theme.palette.primary.main, 0.3),
                borderColor: theme.palette.primary.main,
                tension: 0.1,
            }],
        };
        
        // Calculate topic performance data for a specific subject
        let topicPerformance = [];
        if (selectedSubject !== 'all' && allTopics.length > 0) {
            const subjectId = allSubjects.find(s => s.subjectKey === selectedSubject)?.id;
            const topicsForSelectedSubject = allTopics.filter(t => t.subject_id === subjectId);
            topicPerformance = topicsForSelectedSubject.map(topic => {
                const topicResults = filteredResults.filter(r => r.topicId === topic.id);
                if (topicResults.length > 0) {
                    const avgScore = Math.round(topicResults.reduce((acc, r) => acc + r.percentage, 0) / topicResults.length);
                    return { id: topic.id, name: topic.name, count: topicResults.length, average: avgScore };
                }
                return null;
            }).filter(Boolean).sort((a, b) => b.average - a.average);
        }
        
        return {
            totalQuizzes: filteredResults.length,
            overallAverageScore: filteredResults.length > 0 ? Math.round(filteredResults.reduce((acc, r) => acc + r.percentage, 0) / filteredResults.length) : 0,
            subjectBreakdowns,
            difficultyPerformance,
            activityData,
            topicPerformance
        };
    }, [filteredResults, allSubjects, allTopics, relevantQuestions, theme, timeFrequency, selectedSubject]);

    // Handlers
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
        error: null, // Basic error handling, can be improved
        timeFrequency,
        selectedSubject,
        isGeneratingPdf,
        processedStats,
        activityChartRef,
        subjectAveragesChartRef,
        topicPerformanceRef,
        handleTimeFrequencyChange,
        handleSubjectChange,
        handleGenerateReport,
    };
};