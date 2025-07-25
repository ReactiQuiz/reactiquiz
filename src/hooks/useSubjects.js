// src/hooks/useSubjects.js
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useQuery } from '@tanstack/react-query'; // <-- Import useQuery

// This is the function that fetches the data.
// We keep it outside the hook so it can be reused.
const fetchSubjects = async () => {
  const { data } = await apiClient.get('/api/subjects');
  if (!Array.isArray(data)) {
    throw new Error('Invalid data format received for subjects.');
  }
  return data;
};

export const useSubjects = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // --- START OF REFACTOR ---
  // useQuery manages isLoading, error, and the data itself.
  // 'subjects' is the unique "query key". TanStack Query uses this to cache the data.
  const { data: subjects = [], isLoading, isError, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });
  // --- END OF REFACTOR ---

  const handleExploreSubject = (subjectKey) => {
    if (subjectKey) {
      navigate(`/subjects/${subjectKey.toLowerCase()}`);
    }
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredSubjects = useMemo(() => {
    if (!searchTerm) {
      return subjects;
    }
    return subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [subjects, searchTerm]);

  return {
    subjects, // The raw data from the query
    isLoading,
    error: isError ? error.message : null, // Pass a clean error message
    searchTerm,
    filteredSubjects,
    handleExploreSubject,
    handleSearchTermChange,
  };
};