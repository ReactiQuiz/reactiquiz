// src/components/results/QuizResultSummary.tsx
/**
 * Quiz Result Summary Component
 * 
 * This component displays a summary of quiz results with animated
 * score and percentage counters. It shows quiz metadata, time taken,
 * and visual progress indicators.
 */
import { useState, useEffect } from 'react';
import {
  Typography, Paper, Divider, Chip, Box, useTheme, Grid, LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import TimerIcon from '@mui/icons-material/Timer';
import { formatTime } from '../../utils/formatTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

/**
 * Quiz Result Summary Component
 * 
 * Displays quiz result summary with:
 * - Animated score and percentage counters
 * - Quiz metadata (topic name, difficulty, class)
 * - Time taken indicator
 * - Visual progress bar
 * - Performance chips and badges
 * 
 * Features:
 * - Smooth animation for score and percentage from 0 to final value
 * - Color-coded progress indicators
 * - Responsive grid layout
 * 
 * @param {Object} props - Component props
 * @param {Object} props.quizResult - Quiz result object with score, percentage, etc.
 * @param {string} [props.quizTitle] - Optional quiz title override
 * @param {string} props.accentColor - Accent color for styling
 * @returns {JSX.Element} Quiz result summary with animated counters
 */
function QuizResultSummary({ quizResult, quizTitle, accentColor }) {
  // Get theme for styling
  const theme = useTheme();
  // Use accent color or default to primary theme color
  const effectiveAccentColor = accentColor || theme.palette.primary.main;
  
  // Destructure quiz result properties
  const {
    topicName, score, totalQuestions, percentage, difficulty,
    class: quizClassFromResult, timeTaken
  } = quizResult || {};

  // State for animated values (score and percentage animate from 0 to final)
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  // Animation runs are managed entirely inside the effect

  /**
   * Animation Effect
   * 
   * Animates score and percentage from 0 to their final values
   * when component mounts or values change. Uses requestAnimationFrame
   * for smooth animations.
   */
  useEffect(() => {
    // Don't animate if values are undefined
    if (score === undefined || percentage === undefined) return;
    
    // Calculate target values (clamped for percentage)
    const scoreTarget = Math.max(0, score);
    const percentageTarget = Math.max(0, Math.min(100, percentage));
    const animationDuration = 1200; // 1.2 seconds
    
    /**
     * Animate Value
     * 
     * Animates a value from start to end over duration.
     * Uses requestAnimationFrame for smooth animation.
     * 
     * @param {number} start - Starting value
     * @param {number} end - Target value
     * @param {number} duration - Animation duration in milliseconds
     * @param {(value: number) => void} setter - Setter function for value
     * @returns {() => void} Cleanup function to cancel animation
     */
    const animateValue = (start, end, duration, setter) => {
        let startTime = null;
        let rafId = null;
        
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Update value based on progress
            setter(Math.floor(progress * (end - start) + start));
            // Continue animation if not complete
            if (progress < 1) rafId = requestAnimationFrame(step);
            else setter(end); // Set final value
        };
        
        // Start animation
        rafId = requestAnimationFrame(step);
        
        // Return cleanup function to cancel animation
        return () => { if (rafId) cancelAnimationFrame(rafId); };
    };

    // Start animations for score and percentage
    const cancelScoreAnimation = animateValue(0, scoreTarget, animationDuration, setAnimatedScore);
    const cancelPercentageAnimation = animateValue(0, percentageTarget, animationDuration, setAnimatedPercentage);

    // Cleanup: Cancel animations on unmount or value change
    return () => {
        cancelScoreAnimation();
        cancelPercentageAnimation();
    };
  }, [score, percentage]);

  if (!quizResult) {
    return <Typography sx={{p:2, textAlign: 'center'}}>Loading summary...</Typography>;
  }

  return (
    <Paper
      elevation={4}
      sx={{
        p: { xs: 2, sm: 3 }, mb: 3, textAlign: 'center',
        borderTop: `5px solid ${effectiveAccentColor}`,
        borderRadius: theme.shape.borderRadius * 1.5,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: effectiveAccentColor, fontWeight: 'bold', mb: 1, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
        {quizTitle || "Quiz Results"}
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom sx={{ textTransform: 'capitalize', color: 'text.secondary', mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
        {topicName || 'N/A'}
      </Typography>
      <Grid container spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
        {quizClassFromResult && ( <Grid item><Chip label={`Class ${quizClassFromResult}`} size="small" variant="outlined" sx={{borderColor: effectiveAccentColor, color: effectiveAccentColor}}/></Grid> )}
        {difficulty && ( <Grid item><Chip label={difficulty} size="small" variant="outlined" sx={{ textTransform: 'capitalize', borderColor: effectiveAccentColor, color: effectiveAccentColor }} /></Grid> )}
        {totalQuestions > 0 && ( <Grid item><Chip label={`${totalQuestions} Qs`} size="small" variant="outlined" sx={{borderColor: effectiveAccentColor, color: effectiveAccentColor}}/></Grid> )}
        {timeTaken != null && ( <Grid item><Chip icon={<TimerIcon />} label={formatTime(timeTaken)} size="small" variant="outlined" sx={{borderColor: effectiveAccentColor, color: effectiveAccentColor}}/></Grid> )}
      </Grid>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ my: 2.5 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 500, mb: 0.5, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          Your Score:
          <Typography component="span" variant="h3" sx={{ color: effectiveAccentColor, fontWeight: 'bold', ml: 1, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
            {animatedScore} / {totalQuestions || 0}
          </Typography>
        </Typography>
        <Box sx={{ width: '100%', maxWidth: '400px', margin: 'auto', mt: 1, mb: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={animatedPercentage}
            sx={{ height: 10, borderRadius: 5, backgroundColor: alpha(effectiveAccentColor, 0.2), '& .MuiLinearProgress-bar': { backgroundColor: effectiveAccentColor } }}
          />
          <Typography variant="h4" component="div" sx={{ color: effectiveAccentColor, fontWeight: 'bold', mt: 0.5, fontSize: { xs: '1.8rem', sm: '2.125rem', md: '2.5rem' } }}>
            {animatedPercentage}%
            {percentage >= 90 && <EmojiEventsIcon sx={{ color: theme.palette.warning.main, verticalAlign: 'middle', fontSize: {xs: '2rem', sm: '2.5rem'}, ml: 0.5 }} />}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default QuizResultSummary;