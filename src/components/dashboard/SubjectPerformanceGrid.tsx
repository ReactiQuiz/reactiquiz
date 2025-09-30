// src/components/dashboard/SubjectPerformanceGrid.js
import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, useTheme, Chip, Divider, Button, Collapse } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const INITIAL_SUBJECT_CARDS_TO_SHOW = 2;

function SubjectPerformanceGrid({ subjectStats, subjectsToShow }) {
  const theme = useTheme();
  const [showAllSubjectCards, setShowAllSubjectCards] = useState(false);

  const handleToggleSubjectCards = () => {
    setShowAllSubjectCards(!showAllSubjectCards);
  };

  if (!subjectStats || Object.keys(subjectStats).length === 0) {
    return (
      <Typography sx={{textAlign: 'center', color: theme.palette.text.secondary, py:3, mt: 2}}>
          No subject-specific performance data available.
      </Typography>
    );
  }

  // --- FIX IS HERE ---
  // The object from `subjectsToShow` (which is `allSubjects` from the API) has `subjectKey`, not `key`.
  const statsToDisplay = subjectsToShow.map(subjConfig => {
    // Add a defensive check to prevent errors if subjConfig is malformed or null
    if (!subjConfig || !subjConfig.subjectKey) {
      console.warn("SubjectPerformanceGrid: Found an invalid subject configuration object:", subjConfig);
      return null;
    }
    const stat = subjectStats[subjConfig.subjectKey.toLowerCase()];
    // Add the `subjectKey` to the stat object itself for use as a unique React key in the renderer.
    return stat ? { ...stat, subjectKey: subjConfig.subjectKey } : null;
  }).filter(Boolean); // Filter out any nulls from malformed configs


  const renderCard = (stats) => (
    // The key here now uses the unique subjectKey from the stats object
    <Grid item key={stats.subjectKey} sx={{ width: { xs: '100%', sm: '47.5%' } }}>
        <Paper
            elevation={2}
            sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            minHeight: '160px', 
            borderTop: `4px solid ${stats.color || theme.palette.grey[500]}`,
            justifyContent: 'center',
            backgroundColor: alpha(stats.color || theme.palette.grey[500], 0.12), 
            height: '100%'
            }}
        >
            <Typography variant="h6" sx={{ color: stats.color || theme.palette.text.primary, fontWeight: 'medium', textAlign: 'center' }}>
            {stats.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
            Quizzes Solved: <Typography component="span" sx={{fontWeight: 'bold', color: theme.palette.text.primary}}>{stats.count}</Typography>
            </Typography>
            <Typography variant="body1" color="text.secondary">
            Average Score: <Typography component="span" sx={{fontWeight: 'bold', color: theme.palette.text.primary}}>{stats.average}%</Typography>
            </Typography>
        </Paper>
    </Grid>
  );


  return (
    <Box>
      <Divider sx={{ my: 3, mb: 4 }}><Chip label="Performance by Subject" sx={{color: theme.palette.text.secondary}} /></Divider>
      
      <Grid container justifyContent="space-between" rowGap={2.5}>
        {statsToDisplay.slice(0, INITIAL_SUBJECT_CARDS_TO_SHOW).map((stats) => (
          renderCard(stats)
        ))}
      </Grid>

      {statsToDisplay.length > INITIAL_SUBJECT_CARDS_TO_SHOW && (
        <Collapse 
          in={showAllSubjectCards} 
          timeout="auto" 
          unmountOnExit 
        >
          <Grid container justifyContent="space-between" rowGap={2.5} sx={{ mt: 2.5 }}> 
              {statsToDisplay.slice(INITIAL_SUBJECT_CARDS_TO_SHOW).map((stats) => (
                  renderCard(stats)
              ))}
          </Grid>
        </Collapse>
      )}

      {statsToDisplay.length > INITIAL_SUBJECT_CARDS_TO_SHOW && (
        <Box sx={{ textAlign: 'center', mt: 2.5 }}>
          <Button
            onClick={handleToggleSubjectCards}
            variant="outlined"
            startIcon={showAllSubjectCards ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ color: theme.palette.text.secondary, borderColor: theme.palette.text.secondary }}
          >
            {showAllSubjectCards ? 'Show Less Subjects' : 'Show More Subjects'}
          </Button>
        </Box>
      )}
      
      {statsToDisplay.length === 0 && (
         <Typography sx={{textAlign: 'center', color: theme.palette.text.secondary, py:3}}>
            No quizzes solved for any subject in the selected period.
         </Typography>
      )}
    </Box>
  );
}

export default SubjectPerformanceGrid;