// src/components/animations/PageTransition.tsx
/**
 * Page Transition Component
 * 
 * This component provides smooth page transitions using Framer Motion.
 * It supports different animation variants for desktop and mobile devices
 * with optimized performance.
 */
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useMediaQuery, useTheme } from '@mui/material';

/**
 * PageTransitionProps Interface
 * 
 * Props for the PageTransition component.
 */
interface PageTransitionProps {
  children: React.ReactNode; // Page content to animate
}

/**
 * Page Variants (Desktop)
 * 
 * Animation variants for desktop page transitions.
 * Features fade, scale, and vertical slide effects.
 */
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99],
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

/**
 * Mobile Page Variants
 * 
 * Animation variants for mobile page transitions.
 * Features fade, horizontal slide, and scale effects
 * optimized for touch interactions.
 */
const mobilePageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 30,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.6, -0.05, 0.01, 0.99],
      staggerChildren: 0.08
    }
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

/**
 * Page Transition Component
 * 
 * Wraps page content with smooth transition animations:
 * - Desktop: Fade, scale, and vertical slide
 * - Mobile: Fade, horizontal slide, and scale
 * - Stagger children animations
 * - Exit animations
 * - Responsive variant selection
 * 
 * This component is used in routing to provide smooth
 * page transitions throughout the application.
 * 
 * @param {PageTransitionProps} props - Component props
 * @returns {JSX.Element} Page content with transition animations
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <motion.div
      variants={isMobile ? mobilePageVariants : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        width: '100%',
        minHeight: '100vh'
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;