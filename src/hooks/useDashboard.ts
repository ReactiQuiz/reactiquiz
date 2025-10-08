// src/hooks/useDashboard.ts
import { useMemo, useRef, useState } from 'react';
import { subDays, format, parseISO, isValid, eachDayOfInterval } from 'date-fns';
import { generateDashboardPdfReport } from '../utils/reportGenerator';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { UseDashboardReturn, QuizResult, Subject, Topic, DashboardStats } from '../types';


// --- Fetcher functions defined outside the hook ---
const fetchUserResults = async (): Promise<QuizResult[]> => {
  const { data } = await apiClient.get<QuizResult[]>('/api/results');
  return data || [];
};

const fetchAllSubjects = async (): Promise<Subject[]> => {
  const { data } = await apiClient.get<Subject[]>('/api/subjects');
  return data || [];
};

const fetchAllTopics = async (): Promise<Topic[]> => {
  const { data } = await apiClient.get<Topic[]>('/api/topics');
  return data || [];
};


export const useDashboard = (): UseDashboardReturn => {
  const { currentUser } = useAuth();

  const [timeFrequency, setTimeFrequency] = useState<'week' | 'month' | 'year'>('month');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const activityChartRef = useRef<HTMLDivElement>(null);
  const topicPerformanceRef = useRef<HTMLDivElement>(null);
  const rollingAverageChartRef = useRef<HTMLDivElement>(null);
  const difficultyBreakdownChartRef = useRef<HTMLDivElement>(null);

  // --- Data fetching with React Query ---
  const { data: userResults = [], isLoading: isLoadingResults } = useQuery({
    queryKey: ['userResults'],
    queryFn: fetchUserResults,
    enabled: !!currentUser,
  });

  const { data: allSubjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['allSubjects'],
    queryFn: fetchAllSubjects,
  });

  const { data: allTopics = [], isLoading: isLoadingTopics } = useQuery({
    queryKey: ['allTopics'],
    queryFn: fetchAllTopics,
  });

  const isLoadingData = isLoadingResults || isLoadingSubjects || isLoadingTopics;

  // --- Process the data based on selected filters ---
  const processedStats = useMemo((): DashboardStats | null => {
    if (!userResults.length || !allSubjects.length || !allTopics.length) {
      return null;
    }

    // Filter results based on time frequency
    const now = new Date();
    let filteredResults: QuizResult[] = [];

    if (timeFrequency === 'week') {
      const weekAgo = subDays(now, 7);
      filteredResults = userResults.filter(result => {
        const resultDate = parseISO(result.timestamp);
        return isValid(resultDate) && resultDate >= weekAgo;
      });
    } else if (timeFrequency === 'month') {
      const monthAgo = subDays(now, 30);
      filteredResults = userResults.filter(result => {
        const resultDate = parseISO(result.timestamp);
        return isValid(resultDate) && resultDate >= monthAgo;
      });
    } else if (timeFrequency === 'year') {
      const yearAgo = subDays(now, 365);
      filteredResults = userResults.filter(result => {
        const resultDate = parseISO(result.timestamp);
        return isValid(resultDate) && resultDate >= yearAgo;
      });
    } else {
      filteredResults = userResults;
    }

    // Filter by subject if not 'all'
    if (selectedSubject !== 'all') {
      filteredResults = filteredResults.filter(result => result.subject === selectedSubject);
    }

    if (filteredResults.length === 0) {
      return {
        totalQuizzes: 0,
        overallAverageScore: 0,
        subjectBreakdowns: {},
        overallQuestionStats: { total: 0, correct: 0, accuracy: 0 },
        subjectDifficultyPerformance: {},
        overallDifficultyPerformance: { easy: { correct: 0, total: 0, percentage: 0 }, medium: { correct: 0, total: 0, percentage: 0 }, hard: { correct: 0, total: 0, percentage: 0 } },
        rollingAverageData: [],
        activityData: [],
        topicPerformance: []
      };
    }

    // Calculate overall stats
    const totalQuizzes = filteredResults.length;
    const overallAverageScore = filteredResults.reduce((sum, result) => sum + result.score, 0) / totalQuizzes;

    // Calculate subject breakdowns
    const subjectBreakdowns: Record<string, { name: string; count: number; average: number; totalCorrect: number; totalQuestions: number }> = {};
    filteredResults.forEach(result => {
      if (!subjectBreakdowns[result.subject]) {
        subjectBreakdowns[result.subject] = { name: result.subject, count: 0, average: 0, totalCorrect: 0, totalQuestions: 0 };
      }
      const breakdown = subjectBreakdowns[result.subject];
      if (breakdown) {
        breakdown.count++;
        breakdown.totalQuestions += result.totalQuestions;
        breakdown.totalCorrect += result.correctAnswers;
      }
    });

    // Calculate average scores for each subject
    Object.keys(subjectBreakdowns).forEach(subject => {
      const subjectResults = filteredResults.filter(r => r.subject === subject);
      const breakdown = subjectBreakdowns[subject];
      if (breakdown) {
        breakdown.average = subjectResults.reduce((sum, result) => sum + result.score, 0) / subjectResults.length;
      }
    });

    // Calculate overall question stats
    const totalQuestions = filteredResults.reduce((sum, result) => sum + result.totalQuestions, 0);
    const correctAnswers = filteredResults.reduce((sum, result) => sum + result.correctAnswers, 0);
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Calculate difficulty performance
    const subjectDifficultyPerformance: Record<string, { easy: { correct: number; total: number; percentage: number }; medium: { correct: number; total: number; percentage: number }; hard: { correct: number; total: number; percentage: number } }> = {};
    
    // This would need to be implemented based on your actual question difficulty data
    // For now, returning empty structure
    Object.keys(subjectBreakdowns).forEach(subject => {
      subjectDifficultyPerformance[subject] = {
        easy: { correct: 0, total: 0, percentage: 0 },
        medium: { correct: 0, total: 0, percentage: 0 },
        hard: { correct: 0, total: 0, percentage: 0 }
      };
    });

    const overallDifficultyPerformance = {
      easy: { correct: 0, total: 0, percentage: 0 },
      medium: { correct: 0, total: 0, percentage: 0 },
      hard: { correct: 0, total: 0, percentage: 0 }
    };

    // Calculate rolling average data
    const rollingAverageData: Array<{ date: string; averageScore: number }> = [];
    const last30Days = eachDayOfInterval({ start: subDays(now, 30), end: now });
    
    last30Days.forEach(day => {
      const dayResults = filteredResults.filter(result => {
        const resultDate = parseISO(result.timestamp);
        return isValid(resultDate) && format(resultDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      
      if (dayResults.length > 0) {
        const dayAverage = dayResults.reduce((sum, result) => sum + result.score, 0) / dayResults.length;
        rollingAverageData.push({
          date: format(day, 'yyyy-MM-dd'),
          averageScore: dayAverage
        });
      }
    });

    // Calculate activity data
    const activityData: Array<{ date: string; quizzes: number; score: number }> = [];
    const activityMap: Record<string, { quizzes: number; totalScore: number }> = {};
    
    filteredResults.forEach(result => {
      const date = format(parseISO(result.timestamp), 'yyyy-MM-dd');
      if (!activityMap[date]) {
        activityMap[date] = { quizzes: 0, totalScore: 0 };
      }
      const activity = activityMap[date];
      if (activity) {
        activity.quizzes++;
        activity.totalScore += result.score;
      }
    });

    Object.entries(activityMap).forEach(([date, data]) => {
      activityData.push({
        date,
        quizzes: data.quizzes,
        score: data.totalScore / data.quizzes
      });
    });

    // Calculate topic performance
    const topicPerformance: Array<{ topicId: string; topicName: string; totalQuizzes: number; averageScore: number; totalQuestions: number; correctAnswers: number }> = [];
    
    // Group results by topic
    const topicMap: Record<string, QuizResult[]> = {};
    filteredResults.forEach(result => {
      if (!topicMap[result.topicId]) {
        topicMap[result.topicId] = [];
      }
      const topicResults = topicMap[result.topicId];
      if (topicResults) {
        topicResults.push(result);
      }
    });

    Object.entries(topicMap).forEach(([topicId, results]) => {
      const topic = allTopics.find(t => t.id === topicId);
      if (topic) {
        const totalQuizzes = results.length;
        const averageScore = results.reduce((sum, result) => sum + result.score, 0) / totalQuizzes;
        const totalQuestions = results.reduce((sum, result) => sum + result.totalQuestions, 0);
        const correctAnswers = results.reduce((sum, result) => sum + result.correctAnswers, 0);
        
        topicPerformance.push({
          topicId,
          topicName: topic.name,
          totalQuizzes,
          averageScore,
          totalQuestions,
          correctAnswers
        });
      }
    });

    return {
      totalQuizzes,
      overallAverageScore,
      subjectBreakdowns,
      overallQuestionStats: { total: totalQuestions, correct: correctAnswers, accuracy },
      subjectDifficultyPerformance,
      overallDifficultyPerformance,
      rollingAverageData,
      activityData,
      topicPerformance
    };
  }, [userResults, allSubjects, allTopics, timeFrequency, selectedSubject]);

  // --- Event handlers ---
  const handleTimeFrequencyChange = (frequency: string): void => {
    if (frequency === 'week') setTimeFrequency('week');
    else if (frequency === 'month') setTimeFrequency('month');
    else if (frequency === 'year') setTimeFrequency('year');
  };

  const handleSubjectChange = (subject: string): void => {
    setSelectedSubject(subject);
  };

  const handleGenerateReport = async (): Promise<void> => {
    if (!processedStats || !currentUser) return;
    
    setIsGeneratingPdf(true);
    try {
      await generateDashboardPdfReport({
        currentUser,
        processedStats,
        timeFrequencyLabel: timeFrequency,
        selectedSubject,
        allSubjects,
        activityChartRef: activityChartRef.current,
        topicPerformanceRef: topicPerformanceRef.current,
        rollingAverageChartRef: rollingAverageChartRef.current,
        difficultyBreakdownChartRef: difficultyBreakdownChartRef.current,
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return {
    allSubjects,
    isLoadingData,
    error: null, // You might want to implement error handling
    timeFrequency,
    selectedSubject,
    processedStats,
    activityChartRef,
    topicPerformanceRef,
    rollingAverageChartRef,
    difficultyBreakdownChartRef,
    handleTimeFrequencyChange,
    handleSubjectChange,
    handleGenerateReport,
    isGeneratingPdf,
  };
};
