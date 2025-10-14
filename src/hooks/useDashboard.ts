// src/hooks/useDashboard.ts
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { parseISO, isValid, subDays, eachDayOfInterval, format } from 'date-fns';

export type TimeFilter = 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface DashboardResult {
  id: string;
  subject: string;
  topicId: string;
  topicName: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number; // 0-100
  score: number; // raw
  timestamp: string; // ISO
}

export interface SubjectMeta { id: string; subjectKey: string; name: string; }
export interface TopicMeta { id: string; name: string; subject_id: string; class: string; genre: string; }

export interface DifficultyStats { correct: number; total: number; percentage: number; }

export interface TopicPerformance {
  id: string;
  name: string;
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  difficultyStats: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
}

export interface TopicPerformance {
  id: string;
  name: string;
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  difficultyStats: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
}

export interface DashboardData {
  totalQuizzes: number;
  overallAverageScore: number;
  overallQuestionStats: { total: number; correct: number; accuracy: number };
  subjectBreakdowns: Record<string, { name: string; count: number; average: number; totalQuestions: number; totalCorrect: number }>;
  subjectDifficultyPerformance: Record<string, { easy: DifficultyStats; medium: DifficultyStats; hard: DifficultyStats }>;
  overallDifficultyPerformance: { easy: DifficultyStats; medium: DifficultyStats; hard: DifficultyStats };
  rollingAverageData: Array<{ date: string; averageScore: number }>;
  chartDifficultyBySubject: Array<{ subject: string; easyPercent: number; mediumPercent: number; hardPercent: number; easyCount: number; mediumCount: number; hardCount: number; total: number; avg: number }>;
  topicPerformance: Record<string, Record<string, TopicPerformance>>;
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

const fetchTopics = async (): Promise<TopicMeta[]> => {
  const { data } = await apiClient.get<TopicMeta[]>('/api/topics');
  return data || [];
};

export function useDashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const { data: results = [], isLoading: loadingResults } = useQuery({ queryKey: ['dashResults'], queryFn: fetchResults });
  const { data: subjects = [], isLoading: loadingSubjects } = useQuery({ queryKey: ['dashSubjects'], queryFn: fetchSubjects });
  const { data: topics = [], isLoading: loadingTopics } = useQuery({ queryKey: ['dashTopics'], queryFn: fetchTopics });

  const isLoading = loadingResults || loadingSubjects || loadingTopics;

  const data = useMemo<DashboardData | null>(() => {
    if (!results.length || !subjects.length) return null;

    // 1) time window
    const now = new Date();
    let startDate: Date | null = null;
    if (timeFilter === 'week') startDate = subDays(now, 7);
    else if (timeFilter === 'month') startDate = subDays(now, 30);
    else if (timeFilter === 'quarter') startDate = subDays(now, 90);
    else if (timeFilter === 'year') startDate = subDays(now, 365);

    let filtered = results.filter(r => {
      const d = parseISO(r.timestamp);
      if (!isValid(d)) return false;
      if (startDate) return d >= startDate;
      return true;
    });

    // 2) subject filter
    if (subjectFilter !== 'all') filtered = filtered.filter(r => r.subject === subjectFilter);

    const totalQuizzes = filtered.length;
    const overallAverageScore = totalQuizzes > 0 ? Number((filtered.reduce((s, r) => s + (r.percentage || 0), 0) / totalQuizzes).toFixed(1)) : 0;

    const totalQuestions = filtered.reduce((s, r) => s + (r.totalQuestions || 0), 0);
    const correctAnswers = filtered.reduce((s, r) => s + (r.correctAnswers || 0), 0);
    const accuracy = totalQuestions > 0 ? Number(((correctAnswers / totalQuestions) * 100).toFixed(1)) : 0;

    // subject breakdown
    const subjectBreakdowns: DashboardData['subjectBreakdowns'] = {};
    filtered.forEach(r => {
      const key = r.subject;
      if (!subjectBreakdowns[key]) subjectBreakdowns[key] = { name: key, count: 0, average: 0, totalQuestions: 0, totalCorrect: 0 };
      subjectBreakdowns[key].count += 1;
      subjectBreakdowns[key].totalQuestions += r.totalQuestions || 0;
      subjectBreakdowns[key].totalCorrect += r.correctAnswers || 0;
    });
    Object.keys(subjectBreakdowns).forEach(key => {
      const sb = subjectBreakdowns[key];
      const subResults = filtered.filter(r => r.subject === key);
      sb.average = subResults.length ? Number((subResults.reduce((s, r) => s + (r.percentage || 0), 0) / subResults.length).toFixed(1)) : 0;
    });

    // difficulty – placeholder since difficulty not per-question here; use percentage tiers as proxy
    const buckets = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
    filtered.forEach(r => {
      if (r.percentage >= 0 && r.percentage < 50) {
        buckets.easy.total += r.totalQuestions || 0;
        buckets.easy.correct += r.correctAnswers || 0;
      } else if (r.percentage < 80) {
        buckets.medium.total += r.totalQuestions || 0;
        buckets.medium.correct += r.correctAnswers || 0;
      } else {
        buckets.hard.total += r.totalQuestions || 0;
        buckets.hard.correct += r.correctAnswers || 0;
      }
    });
    const pct = (c: number, t: number) => (t > 0 ? Number(((c / t) * 100).toFixed(1)) : 0);
    const overallDifficultyPerformance = {
      easy: { correct: buckets.easy.correct, total: buckets.easy.total, percentage: pct(buckets.easy.correct, buckets.easy.total) },
      medium: { correct: buckets.medium.correct, total: buckets.medium.total, percentage: pct(buckets.medium.correct, buckets.medium.total) },
      hard: { correct: buckets.hard.correct, total: buckets.hard.total, percentage: pct(buckets.hard.correct, buckets.hard.total) },
    };

    const subjectDifficultyPerformance: DashboardData['subjectDifficultyPerformance'] = {};
    const chartDifficultyBySubject: DashboardData['chartDifficultyBySubject'] = [];
    const topicPerformance: DashboardData['topicPerformance'] = {};

    Object.keys(subjectBreakdowns).forEach(key => {
      const subRes = filtered.filter(r => r.subject === key);
      const b = { easy: { c: 0, t: 0 }, medium: { c: 0, t: 0 }, hard: { c: 0, t: 0 } };
      
      // Initialize topic performance for this subject
      topicPerformance[key] = {};
      
      // Group results by topic
      const topicResults = subRes.reduce((acc, r) => {
        if (!acc[r.topicId]) {
          acc[r.topicId] = {
            results: [],
            buckets: { easy: { c: 0, t: 0 }, medium: { c: 0, t: 0 }, hard: { c: 0, t: 0 } }
          };
        }
        acc[r.topicId].results.push(r);
        
        // Calculate difficulty stats for topic
        const d = r.difficulty ? String(r.difficulty).toLowerCase() : (r.percentage < 50 ? 'easy' : (r.percentage < 80 ? 'medium' : 'hard'));
        if (d === 'easy') {
          acc[r.topicId].buckets.easy.t += r.totalQuestions || 0;
          acc[r.topicId].buckets.easy.c += r.correctAnswers || 0;
        } else if (d === 'medium') {
          acc[r.topicId].buckets.medium.t += r.totalQuestions || 0;
          acc[r.topicId].buckets.medium.c += r.correctAnswers || 0;
        } else {
          acc[r.topicId].buckets.hard.t += r.totalQuestions || 0;
          acc[r.topicId].buckets.hard.c += r.correctAnswers || 0;
        }
        return acc;
      }, {} as Record<string, { results: DashboardResult[], buckets: typeof b }>);

      // Calculate topic performance
      Object.entries(topicResults).forEach(([topicId, data]) => {
        const { results, buckets: tb } = data;
        const totalQuizzes = results.length;
        const averageScore = totalQuizzes > 0 ? Number((results.reduce((s, r) => s + (r.percentage || 0), 0) / totalQuizzes).toFixed(1)) : 0;
        const totalQuestions = results.reduce((s, r) => s + (r.totalQuestions || 0), 0);
        const correctAnswers = results.reduce((s, r) => s + (r.correctAnswers || 0), 0);

        topicPerformance[key][topicId] = {
          id: topicId,
          name: results[0]?.topicName || '',
          totalQuizzes,
          averageScore,
          totalQuestions,
          correctAnswers,
          difficultyStats: {
            easy: { correct: tb.easy.c, total: tb.easy.t, percentage: pct(tb.easy.c, tb.easy.t) },
            medium: { correct: tb.medium.c, total: tb.medium.t, percentage: pct(tb.medium.c, tb.medium.t) },
            hard: { correct: tb.hard.c, total: tb.hard.t, percentage: pct(tb.hard.c, tb.hard.t) }
          }
        };

        // Add to subject totals
        b.easy.t += tb.easy.t;
        b.easy.c += tb.easy.c;
        b.medium.t += tb.medium.t;
        b.medium.c += tb.medium.c;
        b.hard.t += tb.hard.t;
        b.hard.c += tb.hard.c;
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
        subject: key, easyPercent: easyP, mediumPercent: medP, hardPercent: hardP,
        easyCount: b.easy.c, mediumCount: b.medium.c, hardCount: b.hard.c,
        total: b.easy.t + b.medium.t + b.hard.t,
        avg: subjectBreakdowns[key].average,
      });
    });

    // rolling average 30 days
    const days = eachDayOfInterval({ start: subDays(now, 30), end: now });
    const rollingAverageData = days.map(d => {
      const dayStr = format(d, 'yyyy-MM-dd');
      const dayResults = filtered.filter(r => format(parseISO(r.timestamp), 'yyyy-MM-dd') === dayStr);
      const avg = dayResults.length ? Number((dayResults.reduce((s, r) => s + (r.percentage || 0), 0) / dayResults.length).toFixed(1)) : 0;
      return { date: dayStr, averageScore: avg };
    });

    return {
      totalQuizzes,
      overallAverageScore,
      overallQuestionStats: { total: totalQuestions, correct: correctAnswers, accuracy },
      subjectBreakdowns,
      subjectDifficultyPerformance,
      overallDifficultyPerformance,
      rollingAverageData,
      chartDifficultyBySubject,
      topicPerformance,
    };
  }, [results, subjects, topics, timeFilter, subjectFilter]);

  const availableSubjects = useMemo(() => ['all', ...Array.from(new Set(results.map(r => r.subject)))], [results]);

  return {
    isLoading,
    data,
    timeFilter,
    setTimeFilter,
    subjectFilter,
    setSubjectFilter,
    availableSubjects,
  };
}


