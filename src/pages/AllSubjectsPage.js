// src/pages/AllSubjectsPage.js
import { Box, Typography, Alert, TextField, InputAdornment, Skeleton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSubjects } from '../hooks/useSubjects';
import SubjectOverviewCard from '../components/topics/SubjectOverviewCard';

function AllSubjectsPage() {
  const { subjects, isLoading, error, searchTerm, filteredSubjects, handleExploreSubject, handleSearchTermChange } = useSubjects();

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
          disabled={isLoading} // Disable input while loading
        />
      </Box>

      {/* --- START OF SKELETON INTEGRATION --- */}
      {isLoading ? (
        // STATE 1: LOADING
        // This skeleton structure exactly mirrors your final content's flexbox layout.
        <Box
          sx={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: { xs: '1%', sm: '10%', md: '1%', lg: '2.5%', xl: '2%' },
            width: '100%'
          }}
        >
          {Array.from(new Array(6)).map((_, index) => (
            <Box
              key={index}
              sx={{
                width: { xs: '100%', sm: '45%', md: '24.25%', lg: '23%', xl: '15%' },
                display: 'flex', py: 2
              }}
            >
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2, width: '100%' }} />
            </Box>
          ))}
        </Box>
      ) : error ? (
        // STATE 2: ERROR
        <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
            <Alert severity="error">{error}</Alert>
        </Box>
      ) : (
        // STATE 3: LOADED CONTENT (Your original layout)
        <>
          {subjects.length > 0 && filteredSubjects.length === 0 && searchTerm && (
            <Typography sx={{ textAlign: 'center', my: 3 }}>
              No subjects found matching "{searchTerm}".
            </Typography>
          )}
          {subjects.length === 0 && (
            <Typography sx={{ textAlign: 'center', my: 3 }}>
              No subjects available at the moment.
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
              gap: { xs: '1%', sm: '10%', md: '1%', lg: '2.5%', xl: '2%' },
              width: '100%'
            }}
          >
            {filteredSubjects.map((subject) => (
              <Box
                key={subject.id}
                sx={{
                  width: { xs: '100%', sm: '45%', md: '24.25%', lg: '23%', xl: '15%' },
                  display: 'flex', py: 2
                }}
              >
                <SubjectOverviewCard
                  subject={subject}
                  onExploreClick={handleExploreSubject}
                />
              </Box>
            ))}
          </Box>
        </>
      )}
      {/* --- END OF SKELETON INTEGRATION --- */}
    </Box>
  );
}

export default AllSubjectsPage;