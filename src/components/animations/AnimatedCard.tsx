// src/components/animations/AnimatedCard.tsx
import React from 'react';
import { Card, CardProps, useTheme, useMediaQuery } from '@mui/material';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { alpha } from '@mui/material/styles';

interface AnimatedCardProps extends CardProps {
  animationType?: 'hover' | 'tilt' | 'float' | 'glow' | 'reveal';
  glowColor?: string;
  enableTiltEffect?: boolean;
  floatIntensity?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  animationType = 'hover',
  glowColor,
  enableTiltEffect = false,
  floatIntensity = 1,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Tilt effect setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [30, -30]), { stiffness: 300, damping: 40 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-30, 30]), { stiffness: 300, damping: 40 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTiltEffect || isMobile) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    if (!enableTiltEffect || isMobile) return;
    x.set(0);
    y.set(0);
  };

  const getAnimationProps = () => {
    const baseProps = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    };

    switch (animationType) {
      case 'hover':
        return {
          ...baseProps,
          whileHover: {
            y: -8,
            scale: 1.02,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          },
          whileTap: isMobile ? { scale: 0.98 } : {}
        };

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
        };

      case 'float':
        return {
          ...baseProps,
          animate: {
            y: [-5 * floatIntensity, 5 * floatIntensity, -5 * floatIntensity]
          },
          whileHover: {
            scale: 1.05
          }
        };

      case 'glow':
        const color = glowColor || theme.palette.primary.main;
        return {
          ...baseProps,
          whileHover: {
            boxShadow: `0 0 30px ${alpha(color, 0.4)}, 0 10px 30px rgba(0,0,0,0.1)`,
            scale: 1.03
          }
        };

      case 'reveal':
        return {
          initial: { opacity: 0, scale: 0.8, rotateY: -90 },
          animate: { opacity: 1, scale: 1, rotateY: 0 },
            whileHover: {
              scale: 1.02
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

// Specialized card variants
export const HoverCard: React.FC<AnimatedCardProps> = (props) => (
  <AnimatedCard
    animationType="hover"
    {...props}
  />
);

export const TiltCard: React.FC<AnimatedCardProps> = (props) => (
  <AnimatedCard
    animationType="tilt"
    enableTiltEffect={true}
    {...props}
  />
);

export const FloatingCard: React.FC<AnimatedCardProps> = ({ floatIntensity = 1, ...props }) => (
  <AnimatedCard
    animationType="float"
    floatIntensity={floatIntensity}
    {...props}
  />
);

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

export const RevealCard: React.FC<AnimatedCardProps> = (props) => (
  <AnimatedCard
    animationType="reveal"
    {...props}
  />
);

export default AnimatedCard;