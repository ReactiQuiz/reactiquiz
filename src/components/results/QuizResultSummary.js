// src/components/results/QuizResultSummary.js
import { useState, useEffect, useRef } from 'react';
import {
  Typography, Paper, Divider, Chip, Box, useTheme, Grid, LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import TimerIcon from '@mui/icons-material/Timer';
import { formatTime } from '../../utils/formatTime'; // Ensure this path is correct
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
// No need to import formatDisplayTopicName here, as topicName should be passed in pre-formatted

function QuizResultSummary({ quizResult, quizTitle, accentColor }) {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  // Destructure directly from quizResult.
  // 'topicName' (the display name) and 'challenge_id' should be properties of the quizResult object.
  const {
    topicName, // This should be the pre-formatted display name passed in quizResult
    score,
    totalQuestions,
    percentage,
    difficulty,
    // numQuestionsConfigured, // Not typically displayed in summary, but totalQuestions is
    class: quizClassFromResult,
    timeTaken,
    challenge_id // This comes directly from the quizResult object
  } = quizResult || {}; // Default to empty object if quizResult is initially undefined

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
      // eslint-disable-next-line
        if (scoreAnimationRef.current) cancelAnimationFrame(scoreAnimationRef.current);
        // eslint-disable-next-line
        if (percentageAnimationRef.current) cancelAnimationFrame(percentageAnimationRef.current);
    };
  }, [score, percentage]);

  if (!quizResult) {
    return <Typography sx={{p:2, textAlign: 'center'}}>Loading summary...</Typography>;
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
        {quizTitle || (challenge_id ? "Challenge Results" : "Quiz Results")}
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
        {/* Use the topicName directly from the quizResult prop */}
        {topicName || 'N/A'}
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
        {(totalQuestions != null && totalQuestions > 0) && (
          <Grid item>
            <Chip label={`${totalQuestions} Qs`} size="small" variant="outlined" sx={{borderColor: effectiveAccentColor, color: effectiveAccentColor}}/>
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
            {animatedScore} / {totalQuestions || 0} {/* Added fallback for totalQuestions */}
          </Typography>
        </Typography>

        <Box sx={{ width: '100%', maxWidth: '400px', margin: 'auto', mt: 1, mb: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={animatedPercentage}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: alpha(effectiveAccentColor, 0.2),
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