// src/pages/AllSubjectsPage.js
import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import apiClient from '../api/axiosInstance';
import SubjectOverviewCard from '../components/SubjectOverviewCard';
import ScienceIcon from '@mui/icons-material/Science';

function AllSubjectsPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
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
    };

    fetchSubjects();
  }, []);

  const handleExploreSubject = (subjectKey) => {
    navigate(`/subjects/${subjectKey.toLowerCase()}`); // Ensure subjectKey is lowercase for consistency
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading subjects...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (subjects.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>No Subjects Available</Typography>
        <Typography>It looks like there are no subjects configured in the database yet.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '100%', margin: 'auto' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 'bold',
          textAlign: 'center',
          mb: { xs: 3, sm: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ScienceIcon sx={{ mr: 1, fontSize: '1.2em' }} />
        Explore Subjects
      </Typography>

      <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
        {subjects.map((subject) => (
          <Grid
            item
            // These props define the flex-basis for the grid item at different breakpoints
            xs={12} // 1 item per row on extra-small
            sm={6}  // 2 items per row on small
            md={4}  // 3 items per row on medium
            lg={3}  // 4 items per row on large
            key={subject.id}
            sx={{
              // The sx.width prop can also be responsive.
              // This will work in conjunction with the flex-basis set by xs, sm, etc.
              // For 1 card on xs: width is 100%
              // For 2 cards on sm: width is 50%
              // For 3 cards on md: width is ~33.33%
              // For 4 cards on lg: width is 25%
              width: {
                xs: '100%',
                sm: '50%',
                md: 'calc(100% / 3)', // More precise for 3 columns than 33.33%
                lg: '25%',
              },
              display: 'flex', // To ensure the card inside fills the height
            }}
          >
            <SubjectOverviewCard
              subject={subject}
              onExploreClick={handleExploreSubject}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default AllSubjectsPage;