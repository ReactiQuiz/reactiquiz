// src/components/animations/AnimatedButton.tsx
/**
 * Animated Button Component
 * 
 * This component displays a button with various animation effects.
 * It supports multiple animation types (bounce, scale, lift, glow, pulse)
 * with Framer Motion animations and mobile optimizations.
 */
import React from 'react';
import { Button, ButtonProps, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';

/**
 * AnimatedButtonProps Interface
 * 
 * Props for the AnimatedButton component.
 */
interface AnimatedButtonProps extends ButtonProps {
  animationType?: 'bounce' | 'scale' | 'lift' | 'glow' | 'pulse'; // Type of animation
  glowColor?: string; // Optional glow color for glow animation
}

/**
 * Animated Button Component
 * 
 * Displays a button with customizable animations:
 * - Multiple animation types (bounce, scale, lift, glow, pulse)
 * - Framer Motion animations
 * - Hover and tap effects
 * - Mobile optimizations (touch targets, no double-tap zoom)
 * - Glow effects with customizable colors
 * 
 * This component is used throughout the application for
 * animated action buttons.
 * 
 * @param {AnimatedButtonProps} props - Component props
 * @returns {JSX.Element} Animated button component
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  animationType = 'scale',
  glowColor,
  sx,
  ...props
}) => {
  // Get theme for styling
  const theme = useTheme();
  // Check if mobile for optimizations
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  /**
   * Get Animation Props
   * 
   * Returns Framer Motion animation props based on animation type.
   * 
   * @returns {Object} Framer Motion animation props
   */
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

/**
 * Primary Animated Button
 * 
 * Specialized variant of AnimatedButton with primary contained style
 * and lift animation.
 */
export const PrimaryAnimatedButton: React.FC<AnimatedButtonProps> = (props) => (
  <AnimatedButton
    variant="contained"
    animationType="lift"
    {...props}
  />
);

/**
 * Secondary Animated Button
 * 
 * Specialized variant of AnimatedButton with outlined style
 * and scale animation.
 */
export const SecondaryAnimatedButton: React.FC<AnimatedButtonProps> = (props) => (
  <AnimatedButton
    variant="outlined"
    animationType="scale"
    {...props}
  />
);

/**
 * Glow Button
 * 
 * Specialized variant of AnimatedButton with contained style
 * and glow animation. Supports custom glow color.
 */
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

/**
 * Pulse Button
 * 
 * Specialized variant of AnimatedButton with contained style
 * and pulse animation.
 */
export const PulseButton: React.FC<AnimatedButtonProps> = (props) => (
  <AnimatedButton
    variant="contained"
    animationType="pulse"
    {...props}
  />
);

export default AnimatedButton;