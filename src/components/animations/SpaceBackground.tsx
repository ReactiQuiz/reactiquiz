import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SpaceBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

const SpaceBackground: React.FC<SpaceBackgroundProps> = ({ className, children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    // Stars data
    const stars: Array<{ x: number; y: number; size: number; opacity: number; speed: number }> = [];
    
    // Create stars
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.5 + 0.1,
      });
    }

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach(star => {
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Animate stars (subtle movement)
        star.opacity = 0.2 + Math.sin(Date.now() * 0.001 + star.x * 0.01) * 0.3;
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      updateCanvasSize();
      // Recreate stars for new dimensions
      stars.length = 0;
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.5 + 0.1,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`relative w-full min-h-[90vh] overflow-hidden ${className || ''}`}>
      {/* Dark space background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-black" />
      
      {/* Animated stars canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />
      
      {/* Curved horizon glow effect - mimicking Bolt.new */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {/* Main horizon curve - Earth's atmosphere effect */}
        <div 
          className="absolute w-[300%] h-[300%] rounded-full"
          style={{
            left: '-100%',
            bottom: '-200%',
            background: `
              radial-gradient(ellipse at center top, 
                rgba(37, 99, 235, 0.2) 0%,
                rgba(59, 130, 246, 0.15) 30%,
                rgba(147, 197, 253, 0.1) 50%,
                rgba(255, 255, 255, 0.05) 70%,
                transparent 90%
              )
            `,
            filter: 'blur(3px)',
          }}
        />
        
        {/* Bright blue atmospheric edge */}
        <div 
          className="absolute w-[250%] h-[250%] rounded-full"
          style={{
            left: '-75%',
            bottom: '-175%',
            background: `
              radial-gradient(ellipse at center top, 
                rgba(59, 130, 246, 0.4) 0%,
                rgba(37, 99, 235, 0.3) 25%,
                rgba(147, 197, 253, 0.2) 45%,
                rgba(255, 255, 255, 0.1) 65%,
                transparent 85%
              )
            `,
            filter: 'blur(2px)',
          }}
        />
        
        {/* Bright white rim - the "space edge" */}
        <div 
          className="absolute w-[200%] h-[200%] rounded-full"
          style={{
            left: '-50%',
            bottom: '-150%',
            background: `
              radial-gradient(ellipse at center top, 
                rgba(255, 255, 255, 0.6) 0%,
                rgba(219, 234, 254, 0.4) 15%,
                rgba(147, 197, 253, 0.3) 30%,
                rgba(59, 130, 246, 0.2) 50%,
                transparent 70%
              )
            `,
            filter: 'blur(1px)',
          }}
        />
        
        {/* Ultra-bright horizon line */}
        <div 
          className="absolute w-[180%] h-[5px]"
          style={{
            left: '-40%',
            bottom: '25%',
            background: `
              linear-gradient(to right,
                transparent 0%,
                rgba(255, 255, 255, 0.8) 20%,
                rgba(255, 255, 255, 1) 50%,
                rgba(255, 255, 255, 0.8) 80%,
                transparent 100%
              )
            `,
            borderRadius: '50%',
            filter: 'blur(1px)',
            transform: 'rotate(-5deg)',
          }}
        />
        
        {/* Subtle atmospheric haze */}
        <div 
          className="absolute w-full h-40"
          style={{
            bottom: '10%',
            background: `
              linear-gradient(to top,
                rgba(59, 130, 246, 0.05) 0%,
                rgba(147, 197, 253, 0.03) 50%,
                transparent 100%
              )
            `,
          }}
        />
        
        {/* Space nebula effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(147, 51, 234, 0.02) 0%, transparent 50%),
              radial-gradient(ellipse at 40% 40%, rgba(16, 185, 129, 0.01) 0%, transparent 50%)
            `,
          }}
        />
      </div>
      
      {/* Content container */}
      <div className="relative z-10 w-full min-h-[90vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default SpaceBackground;
