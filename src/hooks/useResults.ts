// src/hooks/useResults.ts
import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { useTopics } from '../contexts/TopicsContext';
import { UseResultsReturn, QuizResult } from '../types';

const fetchAllResults = async (): Promise<QuizResult[]> => {
  const { data } = await apiClient.get<QuizResult[]>('/api/results');
  return data || [];
};

// fetchQuestionsByIds was unused; removed to satisfy linter

export const useResults = (): UseResultsReturn => {
  const { resultId } = useParams<{ resultId?: string }>();
  const { currentUser } = useAuth();
  const { topics: allTopics } = useTopics();

  const [filters, setFilters] = useState<{ subject: string; difficulty: string; class: string; genre: string }>({ 
    subject: 'all', 
    difficulty: 'all', 
    class: 'all', 
    genre: 'all' 
  });
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'score-high' | 'score-low'>('newest');

  const clearFilters = useCallback((): void => {
    setFilters({ subject: 'all', difficulty: 'all', class: 'all', genre: 'all' });
    setSortOrder('newest');
  }, []);

  const { data: allResults = [], isLoading: isLoadingList, error: listError } = useQuery({
    queryKey: ['userResults', currentUser?.id],
    queryFn: fetchAllResults,
    enabled: !!currentUser,
  });

  const { data: detailData, isLoading: isLoadingDetail, error: detailError } = useQuery({
    queryKey: ['resultDetail', resultId],
    queryFn: async () => {
      if (!resultId) return null;
      const { data } = await apiClient.get<QuizResult>(`/api/results/${resultId}`);
      return data;
    },
    enabled: !!resultId,
  });

  const processedResults = useMemo(() => {
    if (!allResults || allResults.length === 0) return [];

    return allResults.map(result => {
      const topic = allTopics.find(t => t.id === result.topicId);
      return {
        ...result,
        topicName: topic?.name || 'Unknown Topic',
        subject: topic?.subject_id || 'Unknown Subject',
        class: topic?.class || 'Unknown Class',
        genre: topic?.genre || 'Unknown Genre',
      };
    });
  }, [allResults, allTopics]);

  const filteredResults = useMemo(() => {
    return processedResults.filter(result => {
      const matchesSubject = filters.subject === 'all' || result.subject === filters.subject;
      const matchesDifficulty = filters.difficulty === 'all' || result.difficulty === filters.difficulty;
      const matchesClass = filters.class === 'all' || result.class === filters.class;
      const matchesGenre = filters.genre === 'all' || result.genre === filters.genre;
      return matchesSubject && matchesDifficulty && matchesClass && matchesGenre;
    });
  }, [processedResults, filters]);

  const sortedResults = useMemo(() => {
    const sorted = [...filteredResults];
    
    switch (sortOrder) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'score-high':
        return sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
      case 'score-low':
        return sorted.sort((a, b) => (a.score || 0) - (b.score || 0));
      default:
        return sorted;
    }
  }, [filteredResults, sortOrder]);

  const availableClasses = useMemo(() => {
    const classes = Array.from(new Set(processedResults.map(r => r.class)));
    return classes.sort();
  }, [processedResults]);

  const availableGenres = useMemo(() => {
    const genres = Array.from(new Set(processedResults.map(r => r.genre)));
    return genres.sort();
  }, [processedResults]);

  const isLoading = isLoadingList || isLoadingDetail;
  const error = listError?.message || detailError?.message || null;

  return {
    historicalList: sortedResults,
    detailData: detailData || null,
    isLoading,
    error,
    filters,
    setFilters,
    sortOrder,
    setSortOrder,
    availableClasses,
    availableGenres,
    clearFilters,
  };
};
