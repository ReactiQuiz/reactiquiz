"use client";
import React, { useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { AnimatePresence, motion, useInView } from 'framer-motion';

interface AnimatedGradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

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

const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = (props) => {
  return <DemoVariant1 {...props} />;
};

export default AnimatedGradientBackground;
