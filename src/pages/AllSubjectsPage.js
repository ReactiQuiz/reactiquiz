// src/pages/AllSubjectsPage.js
import { Box, Typography, CircularProgress, Alert, /* Grid, NO LONGER NEEDED FOR CARD LAYOUT */ TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSubjects } from '../hooks/useSubjects';
import SubjectOverviewCard from '../components/topics/SubjectOverviewCard';

function AllSubjectsPage() {
  const {
    subjects,
    isLoading,
    error,
    searchTerm,
    filteredSubjects,
    handleExploreSubject,
    handleSearchTermChange,
  } = useSubjects();

  if (isLoading) { return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh"><CircularProgress /><Typography sx={{ ml: 2 }}>Loading subjects...</Typography></Box>); }
  if (error) { return (<Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}><Alert severity="error">{error}</Alert></Box>); }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', margin: 'auto' }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, mt: { xs: 1, sm: 1 } }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search Subjects"
          placeholder="Enter subject name or keyword..."
          value={searchTerm}
          onChange={handleSearchTermChange}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
          }}
        />
      </Box>

      {subjects.length > 0 && filteredSubjects.length === 0 && searchTerm && (
        <Typography sx={{ textAlign: 'center', my: 3 }}>
          No subjects found matching "{searchTerm}".
        </Typography>
      )}
      {subjects.length === 0 && !isLoading && (
        <Typography sx={{ textAlign: 'center', my: 3 }}>
          No subjects available at the moment.
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: {
            xs: '1%',
            sm: '10%',
            md: '1%',
            lg: '2%',
            xl: '2%'
          }, width: '100%'
        }}
      >
        {filteredSubjects.map((subject) => (
          <Box
            key={subject.id}
            sx={{
              width: {
                xs: '100%',
                sm: '45%',
                md: '24.25%',
                lg: '15%',
                xl: '15%'
              },
              display: 'flex',
              py: 2
            }}
          >
            <SubjectOverviewCard
              subject={subject}
              onExploreClick={handleExploreSubject}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default AllSubjectsPage;
