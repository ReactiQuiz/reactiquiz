// src/pages/AllSubjectsPage.js
import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, /* Grid, NO LONGER NEEDED FOR CARD LAYOUT */ TextField, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

import apiClient from '../api/axiosInstance';
import SubjectOverviewCard from '../components/topics/SubjectOverviewCard';

const FIXED_CARD_WIDTH = 280; // Define your desired fixed card width in pixels
const CARD_SPACING = 2; // Theme spacing units (e.g., 2 * 8px = 16px)

function AllSubjectsPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // ... fetchSubjects logic remains the same ...
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
    navigate(`/subjects/${subjectKey.toLowerCase()}`);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) { return ( <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh"><CircularProgress /><Typography sx={{ ml: 2 }}>Loading subjects...</Typography></Box> ); }
  if (error) { return ( <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}><Alert severity="error">{error}</Alert></Box> ); }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '100%', margin: 'auto' }}>
      <Box sx={{ mb: {xs: 2, sm: 3, md: 4}, mt: {xs: 1, sm: 1} }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search Subjects"
          placeholder="Enter subject name or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: ( <InputAdornment position="start"><SearchIcon /></InputAdornment> ),
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

      {/* Flex container for fixed-width cards */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap', // Allow items to wrap to the next line
          justifyContent: 'center', // Center the items horizontally
          gap: CARD_SPACING, // Use theme spacing for gap
          py: 2 // Some vertical padding for the container
        }}
      >
        {filteredSubjects.map((subject) => (
          // Each item wrapper has a fixed width
          <Box
            key={subject.id}
            sx={{
              width: FIXED_CARD_WIDTH, // Apply fixed width
              minWidth: FIXED_CARD_WIDTH, // Ensure it doesn't shrink below this
              // Optionally, a maxWidth if you don't want it to stretch in some edge cases
              // maxWidth: FIXED_CARD_WIDTH,
              display: 'flex', // To make the card inside stretch to 100% height if needed
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