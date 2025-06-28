// src/hooks/useSubjects.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';

/**
 * A custom hook to manage fetching and filtering of subjects.
 * @returns {object} An object containing subjects data, state, and handlers.
 */
export const useSubjects = () => {
  const navigate = useNavigate();

  // --- State Management ---
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Data Fetching ---
  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/api/subjects');
      if (Array.isArray(response.data)) {
        setSubjects(response.data);
      } else {
        setError('Invalid data format received for subjects.');
        setSubjects([]);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError(`Failed to load subjects: ${err.response?.data?.message || err.message}`);
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // --- Event Handlers ---
  const handleExploreSubject = (subjectKey) => {
    if (subjectKey) {
      navigate(`/subjects/${subjectKey.toLowerCase()}`);
    }
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // --- Memoized Filtering Logic ---
  const filteredSubjects = useMemo(() => {
    if (!searchTerm) {
      return subjects;
    }
    return subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [subjects, searchTerm]);

  // --- Return all state and handlers needed by the component ---
  return {
    subjects,
    isLoading,
    error,
    searchTerm,
    filteredSubjects,
    handleExploreSubject,
    handleSearchTermChange,
  };
};