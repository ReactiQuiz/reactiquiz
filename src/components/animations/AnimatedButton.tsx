// src/components/animations/AnimatedButton.tsx
import React from 'react';
import { Button, ButtonProps, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';

interface AnimatedButtonProps extends ButtonProps {
  animationType?: 'bounce' | 'scale' | 'lift' | 'glow' | 'pulse';
  glowColor?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  animationType = 'scale',
  glowColor,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const getAnimationProps = () => {
    const baseProps = {
      whileTap: { scale: 0.98 }
    };

    switch (animationType) {
      case 'bounce':
        return {
          ...baseProps,
          whileHover: { 
            y: -3,
            scale: 1.02
          }
        };
        
      case 'scale':
        return {
          ...baseProps,
          whileHover: { 
            scale: 1.05
          }
        };
        
      case 'lift':
        return {
          ...baseProps,
          whileHover: { 
            y: -5,
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
          }
        };
        
      case 'glow':
        const color = glowColor || theme.palette.primary.main;
        return {
          ...baseProps,
          whileHover: { 
            boxShadow: `0 0 20px ${alpha(color, 0.6)}`,
            scale: 1.02
          }
        };
        
      case 'pulse':
        return {
          ...baseProps,
          animate: {
            scale: [1, 1.02, 1]
          },
          whileHover: { 
            scale: 1.05
          }
        };
        
      default:
        return baseProps;
    }
  };

  const animationProps = getAnimationProps();

  return (
    <motion.div
      {...animationProps}
      style={{ display: 'inline-block' }}
    >
      <Button
        {...props}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          '&::before': animationType === 'glow' ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.5s ease',
          } : {},
          '&:hover::before': animationType === 'glow' ? {
            left: '100%'
          } : {},
          // Mobile-specific optimizations
          ...(isMobile && {
            minHeight: 48, // Ensure touch target size
            fontSize: '1rem',
            touchAction: 'manipulation', // Prevent double-tap zoom
          }),
          ...sx
        }}
      >
        {children}
      </Button>
    </motion.div>
  );
};

// Specialized animated button variants
export const PrimaryAnimatedButton: React.FC<AnimatedButtonProps> = (props) => (
  <AnimatedButton
    variant="contained"
    animationType="lift"
    {...props}
  />
);

export const SecondaryAnimatedButton: React.FC<AnimatedButtonProps> = (props) => (
  <AnimatedButton
    variant="outlined"
    animationType="scale"
    {...props}
  />
);

export const GlowButton: React.FC<AnimatedButtonProps> = ({ glowColor, ...props }) => {
  const theme = useTheme();
  
  return (
    <AnimatedButton
      variant="contained"
      animationType="glow"
      glowColor={glowColor || theme.palette.secondary.main}
      {...props}
    />
  );
};

export const PulseButton: React.FC<AnimatedButtonProps> = (props) => (
  <AnimatedButton
    variant="contained"
    animationType="pulse"
    {...props}
  />
);

export default AnimatedButton;