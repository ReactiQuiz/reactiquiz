// src/pages/AllSubjectsPage.js
import { Box, Typography, Alert, TextField, InputAdornment, Grid, Skeleton } from '@mui/material'; // <-- Add Grid, Skeleton
import SearchIcon from '@mui/icons-material/Search';
import { useSubjects } from '../hooks/useSubjects';
import SubjectOverviewCard from '../components/topics/SubjectOverviewCard';

function AllSubjectsPage() {
  const { subjects, isLoading, error, searchTerm, filteredSubjects, handleExploreSubject, handleSearchTermChange } = useSubjects();

  // --- START OF SKELETON LOADER LOGIC ---
  const renderSkeletons = () => {
    return (
      <Grid container spacing={2}>
        {Array.from(new Array(6)).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  };
  // --- END OF SKELETON LOADER LOGIC ---

  // Main render logic update
  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <TextField fullWidth variant="outlined" label="Search Subjects" disabled sx={{ mb: 4 }} />
        {renderSkeletons()}
      </Box>
    );
  }

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
            lg: '2.5%',
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
                lg: '23%',
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