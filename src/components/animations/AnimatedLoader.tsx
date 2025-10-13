// src/components/animations/AnimatedLoader.tsx
import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';

interface AnimatedLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({ 
  message = "Loading...", 
  size = 'medium' 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const sizeMap = {
    small: { container: 60, dot: 8 },
    medium: { container: 80, dot: 12 },
    large: { container: 120, dot: 16 }
  };
  
  const currentSize = sizeMap[size];
  
  const containerVariants = {
    animate: {
      rotate: 360
    }
  };
  
  const dotVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5]
    }
  };
  
  const textVariants = {
    animate: {
      opacity: [0.6, 1, 0.6]
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 3,
        position: 'relative'
      }}
    >
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          width: currentSize.container * 2,
          height: currentSize.container * 2,
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 0
        }}
      />
      
      {/* Main Loader Container */}
      <motion.div
        variants={containerVariants}
        animate="animate"
        style={{
          width: currentSize.container,
          height: currentSize.container,
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Outer Ring */}
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderTop: `2px solid ${theme.palette.primary.main}`,
            borderRadius: '50%'
          }}
        />
        
        {/* Inner Dots */}
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            variants={dotVariants}
            animate="animate"
            style={{
              position: 'absolute',
              width: currentSize.dot,
              height: currentSize.dot,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: '50%',
              top: '50%',
              left: '50%',
              transformOrigin: '50% 50%',
              transform: `translate(-50%, -50%) rotate(${index * 90}deg) translateY(-${currentSize.container / 2.5}px)`
            }}
          />
        ))}
        
        {/* Center Pulse */}
        <motion.div
          animate={{
            scale: [0.5, 1, 0.5],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: currentSize.dot * 1.5,
            height: currentSize.dot * 1.5,
            background: `radial-gradient(circle, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </motion.div>
      
      {/* Loading Text */}
      <motion.div variants={textVariants} animate="animate">
        <Typography
          variant={isMobile ? "body1" : "h6"}
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 500,
            letterSpacing: 1,
            textAlign: 'center'
          }}
        >
          {message}
        </Typography>
      </motion.div>
      
      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-20, -40, -20],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3 + i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3
          }}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            background: theme.palette.primary.main,
            borderRadius: '50%',
            top: `${30 + Math.random() * 40}%`,
            left: `${20 + Math.random() * 60}%`,
            zIndex: 0
          }}
        />
      ))}
    </Box>
  );
};

export default AnimatedLoader;