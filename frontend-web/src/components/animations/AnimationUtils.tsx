// src/components/animations/AnimationUtils.tsx
/**
 * Animation Utilities
 * 
 * This file provides reusable animation variants, hooks, and components
 * for Framer Motion animations. All animations are optimized for mobile
 * performance and include intersection observer support.
 */
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * Fade In Up Animation Variant
 * 
 * Animates element fading in from below with scale effect.
 * Optimized for mobile with easing curve.
 */
export const fadeInUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 40,
    scale: 0.95 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99],
    }
  }
};

/**
 * Fade In Left Animation Variant
 * 
 * Animates element fading in from the left with scale effect.
 */
export const fadeInLeft: Variants = {
  initial: { 
    opacity: 0, 
    x: -60,
    scale: 0.9 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
    }
  }
};

/**
 * Fade In Right Animation Variant
 * 
 * Animates element fading in from the right with scale effect.
 */
export const fadeInRight: Variants = {
  initial: { 
    opacity: 0, 
    x: 60,
    scale: 0.9 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
    }
  }
};

/**
 * Scale In Animation Variant
 * 
 * Animates element scaling in from small to full size with fade.
 */
export const scaleIn: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.8 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99],
    }
  }
};

/**
 * Bounce In Animation Variant
 * 
 * Animates element with bounce effect from below.
 */
export const bounceIn: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.3,
    y: 50 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.68, -0.55, 0.265, 1.55],
    }
  }
};

/**
 * Stagger Container Animation Variant
 * 
 * Provides stagger animation for child elements.
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

/**
 * Stagger Container Fast Animation Variant
 * 
 * Provides faster stagger animation for child elements.
 */
export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    }
  }
};

/**
 * Floating Animation Variant
 * 
 * Continuous floating animation for hero elements.
 * Repeats infinitely with smooth up-down motion.
 */
export const floatingAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

/**
 * Pulse Animation Variant
 * 
 * Continuous pulse animation for call-to-action elements.
 * Repeats infinitely with scale pulsing effect.
 */
export const pulseAnimation: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

/**
 * Hover Scale Animation
 * 
 * Scale animation for hover interactions.
 * Scales up on hover, down on tap.
 */
export const hoverScale = {
  whileHover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  whileTap: { 
    scale: 0.98 
  }
};

/**
 * Hover Lift Animation
 * 
 * Lift animation for hover interactions.
 * Lifts and scales on hover, slight press on tap.
 */
export const hoverLift = {
  whileHover: { 
    y: -8,
    scale: 1.02,
    transition: { duration: 0.3 }
  },
  whileTap: { 
    y: -2,
    scale: 0.98 
  }
};

/**
 * Use Animation In View Hook
 * 
 * Custom hook for intersection observer-based animations.
 * Optimized for mobile with configurable threshold.
 * 
 * @param {number} threshold - Intersection threshold (default: 0.1)
 * @returns {[React.RefObject, boolean]} Ref and inView state tuple
 */
export const useAnimationInView = (threshold = 0.1) => {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true,
    rootMargin: '-50px 0px'
  });
  
  return [ref, inView] as const;
};

/**
 * AnimatedSectionProps Interface
 * 
 * Props for the AnimatedSection component.
 */
interface AnimatedSectionProps {
  children: React.ReactNode; // Content to animate
  variants?: Variants; // Animation variants (default: fadeInUp)
  className?: string; // Optional CSS class name
  delay?: number; // Animation delay in seconds (default: 0)
}

/**
 * Animated Section Component
 * 
 * Wraps content with intersection observer-based animation.
 * Animates when scrolled into view.
 */
export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  variants = fadeInUp,
  className,
  delay = 0
}) => {
  const [ref, inView] = useAnimationInView();
  
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="initial"
      animate={inView ? "animate" : "initial"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered Container Component
 * 
 * Container for multiple items with stagger animation.
 * Animates children sequentially when scrolled into view.
 */
export const StaggeredContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className, delay = 0 }) => {
  const [ref, inView] = useAnimationInView();
  
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="initial"
      animate={inView ? "animate" : "initial"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Particle Field Component
 * 
 * Displays a background particle system with animated particles.
 * Optimized for mobile performance.
 * 
 * @param {Object} props - Component props
 * @param {number} props.count - Number of particles (default: 20)
 * @returns {JSX.Element} Particle field background
 */
export const ParticleField: React.FC<{ count?: number }> = ({ count = 20 }) => {
  const particles = Array.from({ length: count }, (_, i) => i);
  
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0
    }}>
      {particles.map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            backgroundColor: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`,
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};