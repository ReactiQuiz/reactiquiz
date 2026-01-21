// src/components/animations/AnimatedCard.tsx
/**
 * Animated Card Component
 * 
 * This component displays a card with various animation effects.
 * It supports multiple animation types (hover, tilt, float, glow, reveal)
 * with 3D tilt effects and Framer Motion animations.
 */
import React from 'react';
import { Card, CardProps, useTheme, useMediaQuery } from '@mui/material';
import { motion, useMotionValue, useSpring, useTransform, type MotionProps } from 'framer-motion';
import { alpha } from '@mui/material/styles';

/**
 * AnimatedCardProps Interface
 * 
 * Props for the AnimatedCard component.
 */
interface AnimatedCardProps extends CardProps {
  animationType?: 'hover' | 'tilt' | 'float' | 'glow' | 'reveal'; // Type of animation
  glowColor?: string; // Optional glow color for glow animation
  enableTiltEffect?: boolean; // Whether to enable 3D tilt effect
  floatIntensity?: number; // Intensity of float animation (default: 1)
}

/**
 * Animated Card Component
 * 
 * Displays a card with customizable animations:
 * - Multiple animation types (hover, tilt, float, glow, reveal)
 * - 3D tilt effect (optional, desktop only)
 * - Framer Motion animations
 * - Hover and tap effects
 * - Mobile optimizations
 * - Glow effects with customizable colors
 * 
 * This component is used throughout the application for
 * animated card displays.
 * 
 * @param {AnimatedCardProps} props - Component props
 * @returns {JSX.Element} Animated card component
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  animationType = 'hover',
  glowColor,
  enableTiltEffect = false,
  floatIntensity = 1,
  sx,
  ...props
}) => {
  // Get theme for styling
  const theme = useTheme();
  // Check if mobile for optimizations
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Tilt effect setup - motion values for mouse tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Transform mouse position to rotation values with spring physics
  const rotateX = useSpring(useTransform(y, [-100, 100], [30, -30]), { stiffness: 300, damping: 40 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-30, 30]), { stiffness: 300, damping: 40 });

  /**
   * Handle Mouse Move
   * 
   * Updates motion values based on mouse position for tilt effect.
   * Only works when tilt effect is enabled and not on mobile.
   */
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTiltEffect || isMobile) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  /**
   * Handle Mouse Leave
   * 
   * Resets motion values when mouse leaves the card.
   * Only works when tilt effect is enabled and not on mobile.
   */
  const handleMouseLeave = () => {
    if (!enableTiltEffect || isMobile) return;
    x.set(0);
    y.set(0);
  };

  /**
   * Get Animation Props
   * 
   * Returns Framer Motion animation props based on animation type.
   * 
   * @returns {MotionProps} Framer Motion animation props
   */
  const getAnimationProps = (): MotionProps => {
    const baseProps = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    } as MotionProps;

    switch (animationType) {
      case 'hover':
        return {
          ...baseProps,
          whileHover: {
            y: -14,
            scale: 1.04,
            boxShadow: '0 30px 60px rgba(0,0,0,0.25)'
          },
          whileTap: isMobile ? { scale: 0.98 } : {}
        } as MotionProps;

      case 'tilt':
        return {
          ...baseProps,
          style: enableTiltEffect && !isMobile ? {
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d' as const
          } : {},
          whileHover: {
            scale: 1.02
          },
          whileTap: isMobile ? { scale: 0.98 } : {}
        } as MotionProps;

      case 'float':
        return {
          ...baseProps,
          animate: {
            y: [-8 * floatIntensity, 8 * floatIntensity, -8 * floatIntensity],
            transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
          },
          whileHover: {
            scale: 1.06
          }
        } as MotionProps;

      case 'glow':
        const color = glowColor || theme.palette.primary.main;
        return {
          ...baseProps,
          whileHover: {
            boxShadow: `0 0 42px ${alpha(color, 0.55)}, 0 18px 46px rgba(0,0,0,0.25)`,
            scale: 1.05
          }
        } as MotionProps;

      case 'reveal':
        return {
          initial: { opacity: 0, scale: 0.8, rotateY: -90 },
          animate: { opacity: 1, scale: 1, rotateY: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } },
            whileHover: {
              scale: 1.04
            }
        } as MotionProps;

      default:
        return baseProps;
    }
  };

  const animationProps: MotionProps = getAnimationProps();

  return (
    <motion.div
      {...animationProps}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Card
        {...props}
        sx={{
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
          // Enhanced mobile touch interactions
          ...(isMobile && {
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }),
          // Tilt effect styling
          ...(enableTiltEffect && !isMobile && {
            transformStyle: 'preserve-3d',
            perspective: 1000
          }),
          // Glow effect shimmer
          ...(animationType === 'glow' && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              transition: 'left 0.6s ease',
              zIndex: 1
            },
            '&:hover::before': {
              left: '100%'
            }
          }),
          ...sx
        }}
      >
        <motion.div
          style={{
            position: 'relative',
            zIndex: 2,
            ...(enableTiltEffect && !isMobile && {
              transformStyle: 'preserve-3d',
              transform: 'translateZ(50px)'
            })
          }}
        >
          {children}
        </motion.div>
      </Card>
    </motion.div>
  );
};

/**
 * Hover Card
 * 
 * Specialized variant of AnimatedCard with hover animation.
 */
export const HoverCard: React.FC<AnimatedCardProps> = (props) => (
  <AnimatedCard
    animationType="hover"
    {...props}
  />
);

/**
 * Tilt Card
 * 
 * Specialized variant of AnimatedCard with tilt animation
 * and 3D tilt effect enabled.
 */
export const TiltCard: React.FC<AnimatedCardProps> = (props) => (
  <AnimatedCard
    animationType="tilt"
    enableTiltEffect={true}
    {...props}
  />
);

/**
 * Floating Card
 * 
 * Specialized variant of AnimatedCard with float animation.
 * Supports custom float intensity.
 */
export const FloatingCard: React.FC<AnimatedCardProps> = ({ floatIntensity = 1, ...props }) => (
  <AnimatedCard
    animationType="float"
    floatIntensity={floatIntensity}
    {...props}
  />
);

/**
 * Glow Card
 * 
 * Specialized variant of AnimatedCard with glow animation.
 * Supports custom glow color, defaults to secondary theme color.
 */
export const GlowCard: React.FC<AnimatedCardProps> = ({ glowColor, ...props }) => {
  const theme = useTheme();
  
  return (
    <AnimatedCard
      animationType="glow"
      glowColor={glowColor || theme.palette.secondary.main}
      {...props}
    />
  );
};

/**
 * Reveal Card
 * 
 * Specialized variant of AnimatedCard with reveal animation.
 * Features 3D rotation reveal effect.
 */
export const RevealCard: React.FC<AnimatedCardProps> = (props) => (
  <AnimatedCard
    animationType="reveal"
    {...props}
  />
);

export default AnimatedCard;