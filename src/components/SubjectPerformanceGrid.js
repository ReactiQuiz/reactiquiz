// src/components/SubjectPerformanceGrid.js
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

  const statsToDisplay = subjectsToShow.map(subjConfig => {
    const stat = subjectStats[subjConfig.key.toLowerCase()];
    return stat ? { ...stat, key: subjConfig.key } : null;
  }).filter(Boolean);


  const renderCard = (stats, key) => (
    <Grid item key={key} sx={{ width: { xs: '100%', sm: '47.5%' } }}>
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
        {statsToDisplay.slice(0, INITIAL_SUBJECT_CARDS_TO_SHOW).map((stats, index) => (
          renderCard(stats, `initial-subj-${index}`)
        ))}
      </Grid>

      {statsToDisplay.length > INITIAL_SUBJECT_CARDS_TO_SHOW && (
        <Collapse 
          in={showAllSubjectCards} 
          timeout="auto" 
          unmountOnExit 
        >
          <Grid container justifyContent="space-between" rowGap={2.5} sx={{ mt: 2.5 }}> 
              {statsToDisplay.slice(INITIAL_SUBJECT_CARDS_TO_SHOW).map((stats, index) => (
                  renderCard(stats, `more-subj-${index}`)
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