// src/pages/AllSubjectsPage.tsx
/**
 * All Subjects Page
 *
 * Matched from AllSubjects.dc.html: a page header, a single search field,
 * and an auto-fit grid of subject cards (240px minimum column).
 */
import React from 'react';
import { Box, Typography, Alert, TextField, InputAdornment, Skeleton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSubjects } from '../hooks/useSubjects';
import SubjectOverviewCard from '../components/topics/SubjectOverviewCard';

const AllSubjectsPage: React.FC = () => {
  const { subjects, isLoading, error, searchTerm, filteredSubjects, handleExploreSubject, handleSearchTermChange } = useSubjects();

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 }, width: '100%' }}>
      <Typography variant="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem' }, mb: 1 }}>
        All subjects
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: '60ch' }}>
        Browse every subject and jump straight into its topics.
      </Typography>

      <TextField
        fullWidth
        label="Search subjects"
        placeholder="e.g. Physics, Maths…"
        value={searchTerm}
        onChange={handleSearchTermChange}
        InputProps={{
          startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>),
        }}
        disabled={isLoading}
        sx={{ maxWidth: 420, mb: 4 }}
      />

      {isLoading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3 }}>
          {Array.from(new Array(6)).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={220} sx={{ borderRadius: 4 }} />
          ))}
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ maxWidth: 600 }}>{error}</Alert>
      ) : (
        <>
          {subjects.length > 0 && filteredSubjects.length === 0 && searchTerm && (
            <Typography sx={{ color: 'text.secondary' }}>
              No subjects match "{searchTerm}".
            </Typography>
          )}
          {subjects.length === 0 && (
            <Typography sx={{ color: 'text.secondary' }}>
              No subjects available at the moment.
            </Typography>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3 }}>
            {filteredSubjects.map((subject) => (
              <SubjectOverviewCard
                key={subject.id}
                subject={subject}
                onExploreClick={handleExploreSubject}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default AllSubjectsPage;
