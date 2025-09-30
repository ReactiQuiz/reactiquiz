// src/components/animations/AnimationUtils.tsx
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Common animation variants optimized for mobile
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

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    }
  }
};

// Floating animation for hero elements
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

// Pulse animation for call-to-action elements
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

// Hover animations
export const hoverScale = {
  whileHover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  whileTap: { 
    scale: 0.98 
  }
};

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

// Mobile-optimized intersection observer hook
export const useAnimationInView = (threshold = 0.1) => {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true,
    rootMargin: '-50px 0px'
  });
  
  return [ref, inView] as const;
};

// Animated container component
interface AnimatedSectionProps {
  children: React.ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
}

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

// Staggered container for multiple items
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

// Background particle system for mobile
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