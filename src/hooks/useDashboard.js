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
const fetchQuestionsByTopicIds = async (topicIds) => {
    if (!topicIds || topicIds.length === 0) return [];
    const requests = topicIds.map(id => apiClient.get(`/api/questions?topicId=${id}`));
    const responses = await Promise.all(requests);
    return responses.flatMap(res => res.data);
};

export const useDashboard = () => {
    const theme = useTheme();
    const { currentUser } = useAuth();
    const { getColor } = useSubjectColors();

    const [timeFrequency, setTimeFrequency] = useState(30);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const activityChartRef = useRef(null);
    const topicPerformanceRef = useRef(null);
    const rollingAverageChartRef = useRef(null);

    // --- Data Fetching Layer: Fetch all data once ---
    const { data: allUserResults = [], isLoading: isLoadingResults } = useQuery({
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

    const allUniqueTopicIds = useMemo(() => [...new Set(allUserResults.map(r => r.topicId))], [allUserResults]);

    const { data: allRelevantQuestions = [], isLoading: isLoadingQuestions } = useQuery({
        queryKey: ['allUserQuestions', currentUser?.id],
        queryFn: () => fetchQuestionsByTopicIds(allUniqueTopicIds),
        enabled: allUniqueTopicIds.length > 0
    });

    const isLoadingData = isLoadingResults || isLoadingSubjects || isLoadingTopics || isLoadingQuestions;

    // --- Complex Data Processing Layer ---
    const processedStats = useMemo(() => {
         const today = startOfDay(new Date());
        const activityStartDate = timeFrequency === 'all' ? (filteredResults.length > 0 ? startOfDay(min(filteredResults.map(r => parseISO(r.timestamp)))) : today) : startOfDay(subDays(today, timeFrequency - 1));
        
        const totalActivityCounts = {};
        const subjectActivityCounts = {}; // New object to hold counts for each subject

        filteredResults.forEach(r => {
            const dayKey = format(startOfDay(parseISO(r.timestamp)), 'yyyy-MM-dd');
            const subjectKey = r.subject;

            // Increment total count
            totalActivityCounts[dayKey] = (totalActivityCounts[dayKey] || 0) + 1;

            // Increment subject-specific count
            if (subjectKey) {
                if (!subjectActivityCounts[subjectKey]) {
                    subjectActivityCounts[subjectKey] = {};
                }
                subjectActivityCounts[subjectKey][dayKey] = (subjectActivityCounts[subjectKey][dayKey] || 0) + 1;
            }
        });

        const chartLabels = eachDayOfInterval({ start: activityStartDate, end: today }).map(d => format(d, 'yyyy-MM-dd'));
        
        // Create the dataset for "Total Quizzes"
        const totalDataset = {
            label: 'Total Quizzes',
            data: chartLabels.map(day => totalActivityCounts[day] || 0),
            fill: true,
            borderColor: theme.palette.text.primary, // A neutral, high-contrast color for the total
            backgroundColor: alpha(theme.palette.text.primary, 0.1),
            tension: 0.3,
            borderWidth: 2,
        };

        // Create datasets for each subject that has activity
        const subjectDatasets = allSubjects
            .filter(subject => subjectActivityCounts[subject.subjectKey]) // Only include subjects with data
            .map(subject => {
                const subjectKey = subject.subjectKey;
                const accentColor = getColor(subjectKey);
                return {
                    label: subject.name,
                    data: chartLabels.map(day => subjectActivityCounts[subjectKey][day] || 0),
                    borderColor: accentColor,
                    backgroundColor: alpha(accentColor, 0.2),
                    tension: 0.3,
                    borderWidth: 2,
                    fill: false, // Only fill the total area
                };
            });

        const activityData = {
            labels: chartLabels,
            datasets: [totalDataset, ...subjectDatasets], // Combine them
        };

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

        const rollingAverageData = { labels: [], data: [] };
        if (resultsInTimePeriod.length > 0) {
            rollingAverageData.labels = chartLabels; // Use the same date labels as the activity chart
            rollingAverageData.data = chartLabels.map(dateStr => {
                const currentDay = parseISO(dateStr);
                const windowStart = startOfDay(subDays(currentDay, 29));

                const resultsInWindow = allUserResults.filter(r => {
                    const resultDate = startOfDay(parseISO(r.timestamp));
                    return isValid(resultDate) && resultDate >= windowStart && resultDate <= currentDay;
                });

                if (resultsInWindow.length === 0) return null;
                const sum = resultsInWindow.reduce((acc, r) => acc + r.percentage, 0);
                return sum / resultsInWindow.length;
            });
        }

        return {
            totalQuizzes: filteredResults.length,
            overallAverageScore: filteredResults.length > 0 ? Math.round(filteredResults.reduce((acc, r) => acc + r.percentage, 0) / filteredResults.length) : 0,
            subjectBreakdowns,
            subjectDifficultyPerformance,
            overallDifficultyPerformance: {
                easy: { correct: overallDifficultyStats.easy.correct, total: overallDifficultyStats.easy.total },
                medium: { correct: overallDifficultyStats.medium.correct, total: overallDifficultyStats.medium.total },
                hard: { correct: overallDifficultyStats.hard.correct, total: overallDifficultyStats.hard.total },
            },
            overallQuestionStats: { correct: overallCorrectAnswers, total: overallTotalQuestions },
            activityData,
            topicPerformance,
            rollingAverageData,
        };
    }, [allUserResults, allSubjects, allTopics, allRelevantQuestions, theme, timeFrequency, selectedSubject]);

    // --- Handlers ---
    const handleTimeFrequencyChange = (event) => setTimeFrequency(event.target.value);
    const handleSubjectChange = (event) => setSelectedSubject(event.target.value);
    const handleGenerateReport = async () => {
        setIsGeneratingPdf(true);
        const timeFreqOption = timeFrequencyOptions.find(opt => opt.value === timeFrequency);
        await generateDashboardPdfReport({
            currentUser,
            overallStats: { totalQuizzes: processedStats.totalQuizzes, overallAverageScore: processedStats.overallAverageScore },
            activityChartElement: activityChartRef.current,
            topicPerformanceElement: topicPerformanceRef.current,
            isSubjectSelected: selectedSubject !== 'all',
            timeFrequencyLabel: timeFreqOption ? timeFreqOption.label : String(timeFrequency),
        });
        setIsGeneratingPdf(false);
    };

    // --- Return statement ---
    return {
        allSubjects,
        isLoadingData,
        error: null,
        timeFrequency,
        selectedSubject,
        isGeneratingPdf,
        processedStats,
        activityChartRef,
        topicPerformanceRef,
        rollingAverageChartRef,
        handleTimeFrequencyChange,
        handleSubjectChange,
        handleGenerateReport,
    };
};