// src/hooks/useDashboard.ts
/**
 * Dashboard Hook
 * 
 * Manages dashboard analytics for quiz results with time and subject filtering.
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { parseISO, isValid, subDays, eachDayOfInterval, format } from 'date-fns';

export type TimeFilter = 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface DashboardResult {
  id: string;
  subject: string;
  topicId: string;
  topicName: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  score: number;
  timestamp: string;
}

export interface SubjectMeta { 
  id: string;
  subjectKey: string;
  name: string;
}

export interface TopicMeta { 
  id: string;
  name: string;
  subject_id: string;
  class: string;
  genre: string;
}

export interface TopicPerformance {
  id: string;
  name: string;
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
}

export interface DashboardData {
  totalQuizzes: number;
  overallAverageScore: number;
  overallQuestionStats: { total: number; correct: number; accuracy: number };
  subjectBreakdowns: Record<string, { name: string; count: number; average: number; totalQuestions: number; totalCorrect: number }>;
  rollingAverageData: Array<{ date: string; averageScore: number }>;
  availableSubjects: string[];
}

const fetchResults = async (): Promise<DashboardResult[]> => {
  const { data } = await apiClient.get<DashboardResult[]>('/api/results');
  return (data || []).map(r => ({
    ...r,
    percentage: Number(r.percentage) || 0,
    totalQuestions: Number(r.totalQuestions) || 0,
    correctAnswers: Number(r.correctAnswers) || 0,
  }));
};

const fetchSubjects = async (): Promise<SubjectMeta[]> => {
  const { data } = await apiClient.get<SubjectMeta[]>('/api/subjects');
  return data || [];
};

export const useDashboard = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const { data: results = [], isLoading: isLoadingResults, isError: isErrorResults, refetch: refetchResults } = useQuery<DashboardResult[]>({
    queryKey: ['dashboard-results'],
    queryFn: fetchResults,
  });

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery<SubjectMeta[]>({
    queryKey: ['dashboard-subjects'],
    queryFn: fetchSubjects,
  });

  const computedData = useMemo<DashboardData | null>(() => {
    if (!results || results.length === 0) {
      return null;
    }

    const now = new Date();
    const filteredResults = results.filter(result => {
      const dt = parseISO(result.timestamp);
      if (!isValid(dt)) return false;

      let inTime = true;
      if (timeFilter === 'week') inTime = dt >= subDays(now, 7);
      else if (timeFilter === 'month') inTime = dt >= subDays(now, 30);
      else if (timeFilter === 'quarter') inTime = dt >= subDays(now, 90);
      else if (timeFilter === 'year') inTime = dt >= subDays(now, 365);

      const subjNorm = (result.subject ? String(result.subject).trim() : 'General').toLowerCase();
      let inSubject = true;
      if (subjectFilter !== 'all') {
        inSubject = subjNorm === subjectFilter.toLowerCase();
      }

      return inTime && inSubject;
    });

    if (filteredResults.length === 0) {
      return null;
    }

    const totalQuizzes = filteredResults.length;
    const overallAverageScore = Math.round(
      filteredResults.reduce((acc, curr) => acc + curr.percentage, 0) / totalQuizzes
    );

    const overallTotalQs = filteredResults.reduce((acc, curr) => acc + curr.totalQuestions, 0);
    const overallCorrectQs = filteredResults.reduce((acc, curr) => acc + curr.correctAnswers, 0);
    const overallQuestionAccuracy = overallTotalQs > 0 ? Math.round((overallCorrectQs / overallTotalQs) * 100) : 0;

    const subjectsMap = new Map(subjects.map(s => [s.subjectKey.toLowerCase(), s.name]));
    const subjectGroups: Record<string, DashboardResult[]> = {};

    filteredResults.forEach(res => {
      const key = (res.subject ? String(res.subject).trim() : 'General').toLowerCase();
      if (!subjectGroups[key]) subjectGroups[key] = [];
      subjectGroups[key].push(res);
    });

    const subjectBreakdowns: DashboardData['subjectBreakdowns'] = {};
    Object.keys(subjectGroups).forEach(key => {
      const group = subjectGroups[key];
      const name = subjectsMap.get(key) || (key.charAt(0).toUpperCase() + key.slice(1));
      const count = group.length;
      const average = Math.round(group.reduce((acc, c) => acc + c.percentage, 0) / count);
      const totalQuestions = group.reduce((acc, c) => acc + c.totalQuestions, 0);
      const totalCorrect = group.reduce((acc, c) => acc + c.correctAnswers, 0);

      subjectBreakdowns[key] = {
        name,
        count,
        average,
        totalQuestions,
        totalCorrect,
      };
    });

    // Rolling Average calculation
    const daysCount = timeFilter === 'week' ? 7 : timeFilter === 'quarter' ? 90 : timeFilter === 'year' ? 365 : 30;
    const intervalDays = timeFilter === 'all'
      ? eachDayOfInterval({ start: subDays(now, 30), end: now })
      : eachDayOfInterval({ start: subDays(now, daysCount), end: now });

    const rollingAverageData = intervalDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayResults = filteredResults.filter(r => r.timestamp.startsWith(dateStr));
      const averageScore = dayResults.length > 0
        ? Math.round(dayResults.reduce((acc, curr) => acc + curr.percentage, 0) / dayResults.length)
        : 0;

      return { date: dateStr, averageScore };
    });

    const availableSubjects = ['all', ...Array.from(new Set(results.map(r => (r.subject ? String(r.subject).trim() : 'General').toLowerCase())))];

    return {
      totalQuizzes,
      overallAverageScore,
      overallQuestionStats: {
        total: overallTotalQs,
        correct: overallCorrectQs,
        accuracy: overallQuestionAccuracy
      },
      subjectBreakdowns,
      rollingAverageData,
      availableSubjects,
    };
  }, [results, subjects, timeFilter, subjectFilter]);

  return {
    data: computedData,
    isLoading: isLoadingResults || isLoadingSubjects,
    isError: isErrorResults,
    timeFilter,
    setTimeFilter,
    subjectFilter,
    setSubjectFilter,
    refetch: refetchResults,
  };
};
