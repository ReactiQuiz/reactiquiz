// src/hooks/useSubjects.ts
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { UseSubjectsReturn, Subject } from '../types';

const fetchSubjects = async (): Promise<Subject[]> => {
  const { data } = await apiClient.get<Subject[]>('/api/subjects');
  if (!Array.isArray(data)) {
    throw new Error('Invalid data format received for subjects.');
  }
  return data;
};

export const useSubjects = (): UseSubjectsReturn => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: subjects = [], isLoading, isError, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  const handleExploreSubject = (subjectKey: string): void => {
    navigate(`/subjects/${subjectKey}`);
  };

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) return subjects;
    
    return subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subjectKey.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subjects, searchTerm]);

  return {
    subjects,
    isLoading,
    error: isError ? (error as Error).message : null,
    searchTerm,
    filteredSubjects,
    handleExploreSubject,
    handleSearchTermChange,
  };
};
