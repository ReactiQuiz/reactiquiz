// src/components/animations/AnimatedGradientBackground.tsx
/**
 * Animated Gradient Background Component
 * 
 * This component displays an animated gradient background using
 * Lottie animations. It provides a fallback static gradient and
 * uses intersection observer for performance.
 */
"use client";
import React, { useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { AnimatePresence, motion, useInView } from 'framer-motion';

/**
 * AnimatedGradientBackgroundProps Interface
 * 
 * Props for the AnimatedGradientBackground component.
 */
interface AnimatedGradientBackgroundProps {
  className?: string; // Optional CSS class name
  children?: React.ReactNode; // Content to display over the background
}

/**
 * Demo Variant 1 Component
 * 
 * Displays animated gradient background with:
 * - Lottie animation from external URL
 * - Fallback static gradient
 * - Intersection observer for performance
 * - Framer Motion fade-in for content
 * 
 * @param {AnimatedGradientBackgroundProps} props - Component props
 * @returns {JSX.Element} Animated gradient background
 */
const DemoVariant1: React.FC<AnimatedGradientBackgroundProps> = ({ className, children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref);

  return (
    <div className={`relative w-full min-h-[90vh] overflow-hidden ${className || ''}`}>
      {/* Static Gradient Background as fallback */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-orange-500" />
      
      {/* Animated Lottie Background */}
      <div className="absolute inset-0 z-0">
        <DotLottieReact
          src="https://lottie.host/8cf4ba71-e5fb-44f3-8134-178c4d389417/0CCdoiCqQE.lottie"
          loop
          autoplay
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content Container */}
      <div 
        ref={ref}
        className="relative z-10 w-full min-h-[90vh]"
      >
        <AnimatePresence>
          {isInView && (
            <motion.div
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Animated Gradient Background Component
 * 
 * Main component that renders the animated gradient background.
 * Currently uses DemoVariant1 implementation.
 * 
 * @param {AnimatedGradientBackgroundProps} props - Component props
 * @returns {JSX.Element} Animated gradient background
 */
const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = (props) => {
  return <DemoVariant1 {...props} />;
};

export default AnimatedGradientBackground;
