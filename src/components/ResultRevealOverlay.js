// src/components/ResultRevealOverlay.js
import { useState, useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material'; // Removed Typography, CircularProgress
import AssessmentIcon from '@mui/icons-material/Assessment'; // Or your preferred MUI icon

function ResultRevealOverlay({ onAnimationComplete }) {
  const theme = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef(null);

  // Start animation immediately when the component mounts
  useEffect(() => {
    setIsAnimating(true); // Start animation

    animationTimeoutRef.current = setTimeout(() => {
      // setIsAnimating(false); // Not strictly needed to set to false here as component will unmount
      onAnimationComplete();
    }, 2000); // 2-second animation for the fill

    // Cleanup timeout if component unmounts during animation
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAnimationComplete]); // onAnimationComplete is a stable function from props

  const cardWidth = { xs: '90vw', sm: '80vw', md: '70vw', lg: '60vw' };
  const cardHeight = { xs: '70vh', sm: '80vh', md: '65vh', lg: '60vh' };
  const cardMinHeight = '500px';

  const iconSize = { xs: '150px', sm: '200px', md: '250px', lg: '300px' };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.98)', // Dark overlay
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: theme.zIndex.modal + 10, 
        cursor: 'default', // No longer interactive itself
      }}
    >
      <Box // The "card"
        sx={{
          width: cardWidth,
          height: cardHeight,
          minHeight: cardMinHeight,
          backgroundColor: 'black', 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: theme.shadows[15],
          padding: theme.spacing(3),
          textAlign: 'center',
          position: 'relative', 
          overflow: 'hidden', 
        }}
      >
        {/* Icon Container - for stacking and clipping */}
        <Box
          sx={{
            position: 'relative', 
            width: iconSize,
            height: iconSize,
            zIndex: 2, 
          }}
        >
          {/* Bottom/Background Icon (Dark Grey - this will be covered) */}
          <AssessmentIcon 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              fontSize: 'inherit', // Inherits size from parent Box
              color: theme.palette.grey[800], // Dark grey, subtly visible on black
            }}
          />
          {/* Top/Foreground Icon (White, Clipped & Animated) */}
          <AssessmentIcon 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              fontSize: 'inherit',
              color: theme.palette.common.white,
              // Animation starts because isAnimating is true on mount
              clipPath: isAnimating ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)', 
              transition: 'clip-path 1.8s cubic-bezier(0.4, 0, 0.2, 1)', 
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default ResultRevealOverlay;