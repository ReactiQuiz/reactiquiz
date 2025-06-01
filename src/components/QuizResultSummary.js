// src/components/QuizResultSummary.js
import { useState, useEffect, useRef } from 'react';
import {
  Typography, Paper, Divider, Chip, Box, useTheme, Grid, LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles'; // <<< ENSURE THIS IMPORT IS PRESENT
import TimerIcon from '@mui/icons-material/Timer';
import { formatTime } from '../utils/formatTime'; 
import { subjectAccentColors as themeSubjectAccentColors } from '../theme';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const subjectAccentColors = themeSubjectAccentColors;

const formatTopicName = (topicId) => {
  if (!topicId) return 'N/A';
  let name = String(topicId).replace(/-/g, ' '); 
  
  name = name.replace(/^homibhabha practice /i, 'Homi Bhabha Practice - ');
  name = name.replace(/^pyq /i, 'PYQ ');

  const classSuffixRegex = /\s(\d+(?:st|nd|rd|th))$/i;
  name = name.replace(classSuffixRegex, (match, p1) => ` - Class ${p1.toUpperCase()}`).trim(); 
  
  name = name.split(' ').map(word => {
      if (word.toLowerCase() === 'class' || word.toLowerCase() === 'std') return word; 
      if (word.includes('-')) { 
          return word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-');
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');

  name = name.replace(/Homi Bhabha Practice - (\w+) (\w+)/i, (match, quizClass, difficulty) => 
    `Homi Bhabha Practice - Std ${quizClass} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`
  );
   name = name.replace(/Pyq (\w+) (\d+)/i, (match, quizClass, year) => 
    `PYQ - Std ${quizClass} (${year})`
  );

  return name;
};


function QuizResultSummary({ quizResult, quizTitle, accentColor }) {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  const { topicId, score, totalQuestions, percentage, difficulty, numQuestionsConfigured, class: quizClassFromResult, timeTaken } = quizResult || {};
  const topicName = formatTopicName(topicId);

  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const scoreAnimationRef = useRef();
  const percentageAnimationRef = useRef();

  useEffect(() => {
    if (score === undefined || percentage === undefined || score === null || percentage === null) {
        setAnimatedScore(0);
        setAnimatedPercentage(0);
        return;
    }

    const scoreTarget = Math.max(0, score); 
    const percentageTarget = Math.max(0, Math.min(100, percentage)); 
    const animationDuration = 1200; 

    const animateValue = (startValue, endValue, duration, setter, animationRef) => {
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3); 
            setter(Math.floor(easedProgress * (endValue - startValue) + startValue));
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(step);
            } else {
                 setter(endValue); 
            }
        };
        animationRef.current = requestAnimationFrame(step);
    };

    setAnimatedScore(0); 
    setAnimatedPercentage(0);
    
    if (scoreAnimationRef.current) cancelAnimationFrame(scoreAnimationRef.current);
    if (percentageAnimationRef.current) cancelAnimationFrame(percentageAnimationRef.current);

    animateValue(0, scoreTarget, animationDuration, setAnimatedScore, scoreAnimationRef);
    animateValue(0, percentageTarget, animationDuration, setAnimatedPercentage, percentageAnimationRef);

    return () => {
        if (scoreAnimationRef.current) cancelAnimationFrame(scoreAnimationRef.current);
        if (percentageAnimationRef.current) cancelAnimationFrame(percentageAnimationRef.current);
    };
  }, [score, percentage]); 

  if (!quizResult) {
    return <Typography>Loading summary...</Typography>;
  }

  return (
    <Paper 
      elevation={4} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        mb: 3, 
        textAlign: 'center', 
        borderTop: `5px solid ${effectiveAccentColor}`,
        borderRadius: theme.shape.borderRadius * 1.5, 
      }}
    >
      <Typography 
        variant="h4"
        component="h1"
        gutterBottom 
        sx={{ 
            color: effectiveAccentColor, 
            fontWeight: 'bold', 
            mb: 1,
            fontSize: { xs: '1.8rem', sm: '2.125rem' }
        }}
      >
        {quizTitle || "Quiz Results"}
      </Typography>
      <Typography 
        variant="h6"
        component="h2" 
        gutterBottom 
        sx={{ 
            textTransform: 'capitalize', 
            color: theme.palette.text.secondary, 
            mb: 2,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}
      >
        {topicName}
      </Typography>
      
      <Grid 
        container 
        spacing={1}
        justifyContent="center" 
        alignItems="center" 
        sx={{ mb: 2 }}
      >
        {quizClassFromResult && (
          <Grid item>
            <Chip label={`Class ${quizClassFromResult}`} size="small" variant="outlined" sx={{borderColor: effectiveAccentColor, color: effectiveAccentColor}}/>
          </Grid>
        )}
        {difficulty && (
          <Grid item>
            <Chip label={difficulty} size="small" variant="outlined" sx={{ textTransform: 'capitalize', borderColor: effectiveAccentColor, color: effectiveAccentColor }} />
          </Grid>
        )}
        {(numQuestionsConfigured != null && numQuestionsConfigured > 0) && (
          <Grid item>
            <Chip label={`${numQuestionsConfigured} Qs`} size="small" variant="outlined" sx={{borderColor: effectiveAccentColor, color: effectiveAccentColor}}/>
          </Grid>
        )}
        {timeTaken != null && (
          <Grid item>
            <Chip icon={<TimerIcon fontSize="small"/>} label={formatTime(timeTaken)} size="small" variant="outlined" sx={{borderColor: effectiveAccentColor, color: effectiveAccentColor}}/>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

      <Box sx={{ my: 2.5 }}>
        <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
                fontWeight: 500, 
                mb: 0.5,
                fontSize: { xs: '1.2rem', sm: '1.5rem' }
            }}
        >
          Your Score:
          <Typography 
            component="span" 
            variant="h3"
            sx={{ 
                color: effectiveAccentColor, 
                fontWeight: 'bold', 
                ml: 1,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            {animatedScore} / {totalQuestions}
          </Typography>
        </Typography>

        <Box sx={{ width: '100%', maxWidth: '400px', margin: 'auto', mt: 1, mb: 1.5 }}>
          <LinearProgress 
            variant="determinate" 
            value={animatedPercentage} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: alpha(effectiveAccentColor, 0.2), // alpha is used here
              '& .MuiLinearProgress-bar': {
                backgroundColor: effectiveAccentColor,
              }
            }} 
          />
          <Typography 
            variant="h4"
            component="div" 
            sx={{ 
                color: effectiveAccentColor, 
                fontWeight: 'bold', 
                mt: 0.5,
                fontSize: { xs: '1.8rem', sm: '2.125rem', md: '2.5rem' }
            }}
          >
            {animatedPercentage}%
            {(percentage >= 90 || percentage === 100) && 
                <EmojiEventsIcon sx={{ color: theme.palette.warning.main, verticalAlign: 'middle', fontSize: {xs: '2rem', sm: '2.5rem'}, ml: 0.5 }} />
            }
          </Typography>
        </Box>
      </Box>
      
    </Paper>
  );
}

export default QuizResultSummary;