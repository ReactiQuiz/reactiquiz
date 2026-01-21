// src/components/animations/ShaderAnimationAuth.tsx
/**
 * Shader Animation Auth Component
 * 
 * This component displays a Canvas-based shader-like animation
 * specifically designed for authentication pages. It creates
 * animated diagonal gradients with color transitions.
 */
import React, { useRef, useEffect } from 'react';

/**
 * ShaderAnimationAuthProps Interface
 * 
 * Props for the ShaderAnimationAuth component.
 */
interface ShaderAnimationAuthProps {
  className?: string; // Optional CSS class name
}

/**
 * Shader Animation Auth Component
 * 
 * Displays a Canvas-based animated background for auth pages with:
 * - Animated diagonal gradient
 * - Time-based color transitions
 * - Diagonal stripe overlay effect
 * - Smooth animations (requestAnimationFrame)
 * - Responsive canvas sizing with device pixel ratio
 * - Dark gradient base (slate colors)
 * 
 * This component is used on authentication pages to provide
 * an animated background effect.
 * 
 * @param {ShaderAnimationAuthProps} props - Component props
 * @returns {JSX.Element} Canvas-based shader animation for auth
 */
const ShaderAnimationAuth: React.FC<ShaderAnimationAuthProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();

    let time = 0;
    const animate = () => {
      time += 0.01;
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, width, height);
      
      // Create diagonal shader-like gradient effect
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      
      // Animated colors based on time
      const r1 = Math.sin(time) * 0.5 + 0.5;
      const g1 = Math.sin(time + 2) * 0.5 + 0.5;
      const b1 = Math.sin(time + 4) * 0.5 + 0.5;
      
      const r2 = Math.sin(time + 1) * 0.5 + 0.5;
      const g2 = Math.sin(time + 3) * 0.5 + 0.5;
      const b2 = Math.sin(time + 5) * 0.5 + 0.5;
      
      const r3 = Math.sin(time + 2) * 0.5 + 0.5;
      const g3 = Math.sin(time + 4) * 0.5 + 0.5;
      const b3 = Math.sin(time + 6) * 0.5 + 0.5;
      
      gradient.addColorStop(0, `rgba(${Math.floor(r1 * 100 + 50)}, ${Math.floor(g1 * 100 + 100)}, ${Math.floor(b1 * 155 + 100)}, 0.8)`);
      gradient.addColorStop(0.5, `rgba(${Math.floor(r2 * 80 + 80)}, ${Math.floor(g2 * 120 + 80)}, ${Math.floor(b2 * 180 + 75)}, 0.6)`);
      gradient.addColorStop(1, `rgba(${Math.floor(r3 * 60 + 120)}, ${Math.floor(g3 * 90 + 90)}, ${Math.floor(b3 * 200 + 55)}, 0.4)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add diagonal stripes effect
      ctx.globalCompositeOperation = 'overlay';
      const stripeGradient = ctx.createLinearGradient(0, 0, width * 0.3, height * 0.3);
      stripeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      stripeGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      stripeGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      
      ctx.fillStyle = stripeGradient;
      for (let i = -width; i < width * 2; i += 60) {
        ctx.save();
        ctx.translate(i + Math.sin(time * 2) * 20, -height);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(0, 0, 30, height * 3);
        ctx.restore();
      }
      
      ctx.globalCompositeOperation = 'source-over';
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      }}
    />
  );
};

export default ShaderAnimationAuth;
