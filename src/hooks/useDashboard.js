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
    const difficultyBreakdownChartRef = useRef(null); 

    const { data: allUserResults = [], isLoading: isLoadingResults } = useQuery({ queryKey: ['userResults', currentUser?.id], queryFn: fetchUserResults, enabled: !!currentUser });
    const { data: allSubjects = [], isLoading: isLoadingSubjects } = useQuery({ queryKey: ['subjects'], queryFn: fetchAllSubjects });
    const { data: allTopics = [], isLoading: isLoadingTopics } = useQuery({ queryKey: ['topics'], queryFn: fetchAllTopics });

    const allUniqueTopicIds = useMemo(() => [...new Set(allUserResults.map(r => r.topicId))], [allUserResults]);

    const { data: allRelevantQuestions = [], isLoading: isLoadingQuestions } = useQuery({
        queryKey: ['allUserQuestions', currentUser?.id],
        queryFn: () => fetchQuestionsByTopicIds(allUniqueTopicIds),
        enabled: allUniqueTopicIds.length > 0
    });

    const isLoadingData = isLoadingResults || isLoadingSubjects || isLoadingTopics || isLoadingQuestions;

    const processedStats = useMemo(() => {
        const today = startOfDay(new Date());
        const overallStartDate = allUserResults.length > 0 ? startOfDay(min(allUserResults.map(r => parseISO(r.timestamp)))) : today;
        const timeFilterStartDate = timeFrequency === 'all' ? overallStartDate : startOfDay(subDays(today, timeFrequency - 1));

        const resultsInTimePeriod = allUserResults.filter(r => {
            const resultDate = parseISO(r.timestamp);
            return isValid(resultDate) && resultDate >= timeFilterStartDate;
        });
        const filteredResults = selectedSubject === 'all'
            ? resultsInTimePeriod
            : resultsInTimePeriod.filter(r => r.subject?.toLowerCase() === selectedSubject.toLowerCase());

        const defaultState = {
            totalQuizzes: 0, overallAverageScore: 0, subjectBreakdowns: {},
            subjectDifficultyPerformance: {},
            overallDifficultyPerformance: { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } },
            overallQuestionStats: { correct: 0, total: 0 },
            activityData: { labels: [], datasets: [] }, topicPerformance: [],
            rollingAverageData: { labels: [], data: [] },
        };
        if (allSubjects.length === 0) return defaultState;

        const questionMap = new Map(allRelevantQuestions.map(q => [q.id, q]));
        const subjectBreakdowns = {};
        const subjectDifficultyPerformance = {};
        const overallDifficultyStats = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
        let overallCorrectAnswers = 0;
        let overallTotalQuestions = 0;

        allSubjects.forEach(subject => {
            const resultsForSubj = filteredResults.filter(r => r.subject === subject.subjectKey);
            if (resultsForSubj.length > 0) {
                const totalQuestionsForSubj = resultsForSubj.reduce((acc, r) => acc + JSON.parse(r.questionsActuallyAttemptedIds || '[]').length, 0);
                const totalCorrectForSubj = resultsForSubj.reduce((acc, r) => acc + r.score, 0);
                subjectBreakdowns[subject.subjectKey] = {
                    name: subject.name,
                    count: resultsForSubj.length,
                    average: Math.round(resultsForSubj.reduce((acc, r) => acc + r.percentage, 0) / resultsForSubj.length),
                    totalQuestions: totalQuestionsForSubj,
                    totalCorrect: totalCorrectForSubj
                };
                const diffStats = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
                for (const result of resultsForSubj) {
                    const userAnswers = JSON.parse(result.userAnswersSnapshot || '{}');
                    const attemptedIds = JSON.parse(result.questionsActuallyAttemptedIds || '[]');
                    for (const qId of attemptedIds) {
                        const question = questionMap.get(qId);
                        if (!question) continue;
                        const d = question.difficulty;
                        let key = '';
                        if (d >= 18) key = 'hard';
                        else if (d >= 14) key = 'medium';
                        else if (d >= 10) key = 'easy';
                        if (key) {
                            diffStats[key].total++;
                            if (userAnswers[qId] === question.correctOptionId) diffStats[key].correct++;
                        }
                    }
                }
                const calcAvg = (c, t) => t > 0 ? (c / t) * 100 : 0;
                subjectDifficultyPerformance[subject.subjectKey] = {
                    easy: { average: calcAvg(diffStats.easy.correct, diffStats.easy.total), count: diffStats.easy.total },
                    medium: { average: calcAvg(diffStats.medium.correct, diffStats.medium.total), count: diffStats.medium.total },
                    hard: { average: calcAvg(diffStats.hard.correct, diffStats.hard.total), count: diffStats.hard.total },
                };
            }
        });

        for (const result of filteredResults) {
            overallTotalQuestions += JSON.parse(result.questionsActuallyAttemptedIds || '[]').length;
            overallCorrectAnswers += result.score;

            const userAnswers = JSON.parse(result.userAnswersSnapshot || '{}');
            const attemptedIds = JSON.parse(result.questionsActuallyAttemptedIds || '[]');
            for (const qId of attemptedIds) {
                const question = questionMap.get(qId);
                if (!question) continue;
                const d = question.difficulty;
                let key = '';
                if (d >= 18) key = 'hard';
                else if (d >= 14) key = 'medium';
                else if (d >= 10) key = 'easy';
                if (key) {
                    overallDifficultyStats[key].total++;
                    if (userAnswers[qId] === question.correctOptionId) overallDifficultyStats[key].correct++;
                }
            }
        }

        const chartLabels = eachDayOfInterval({ start: timeFilterStartDate, end: today }).map(d => format(d, 'yyyy-MM-dd'));
        const totalActivityCounts = {};
        const subjectActivityCounts = {};
        resultsInTimePeriod.forEach(r => {
            const dayKey = format(startOfDay(parseISO(r.timestamp)), 'yyyy-MM-dd');
            totalActivityCounts[dayKey] = (totalActivityCounts[dayKey] || 0) + 1;
            if (r.subject) {
                if (!subjectActivityCounts[r.subject]) subjectActivityCounts[r.subject] = {};
                subjectActivityCounts[r.subject][dayKey] = (subjectActivityCounts[r.subject][dayKey] || 0) + 1;
            }
        });
        const totalDataset = { label: 'Total Quizzes', data: chartLabels.map(day => totalActivityCounts[day] || 0), fill: true, borderColor: theme.palette.text.primary, backgroundColor: alpha(theme.palette.text.primary, 0.1), tension: 0.3, borderWidth: 2 };
        const subjectDatasets = allSubjects.filter(subject => subjectActivityCounts[subject.subjectKey]).map(subject => {
            const accentColor = getColor(subject.subjectKey);
            return { label: subject.name, data: chartLabels.map(day => subjectActivityCounts[subject.subjectKey][day] || 0), borderColor: accentColor, backgroundColor: alpha(accentColor, 0.2), tension: 0.3, borderWidth: 2, fill: false };
        });
        const activityData = { labels: chartLabels, datasets: [totalDataset, ...subjectDatasets] };

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
            rollingAverageData.labels = chartLabels;
            rollingAverageData.data = chartLabels.map(dateStr => {
                const currentDay = parseISO(dateStr);
                const windowStart = startOfDay(subDays(currentDay, 29));
                const resultsInWindow = allUserResults.filter(r => {
                    const resultDate = startOfDay(parseISO(r.timestamp));
                    return isValid(resultDate) && resultDate >= windowStart && resultDate <= currentDay;
                });
                if (resultsInWindow.length === 0) return null;
                return resultsInWindow.reduce((acc, r) => acc + r.percentage, 0) / resultsInWindow.length;
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
    }, [allUserResults, allSubjects, allTopics, allRelevantQuestions, theme, timeFrequency, selectedSubject, getColor]);

    const handleTimeFrequencyChange = (event) => setTimeFrequency(event.target.value);
    const handleSubjectChange = (event) => setSelectedSubject(event.target.value);
const handleGenerateReport = async () => {
        setIsGeneratingPdf(true);
        const timeFreqOption = timeFrequencyOptions.find(opt => opt.value === timeFrequency);
        await generateDashboardPdfReport({
            currentUser,
            processedStats, // Pass the whole object
            activityChartRef: activityChartRef,
            rollingAverageChartRef: rollingAverageChartRef,
            difficultyBreakdownChartRef: difficultyBreakdownChartRef,
            topicPerformanceRef: topicPerformanceRef,
            allSubjects,
            timeFrequencyLabel: timeFreqOption ? timeFreqOption.label : String(timeFrequency),
            selectedSubject
        });
        setIsGeneratingPdf(false);
    };

    // --- START OF THE DEFINITIVE FIX: Corrected return statement ---
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
        difficultyBreakdownChartRef,
        handleTimeFrequencyChange,
        handleSubjectChange,
        handleGenerateReport,
    };
    // --- END OF THE DEFINITIVE FIX ---
};