// src/components/animations/LiquidGlassButton.tsx
/**
 * Liquid Glass Button Component
 * 
 * This component displays a button with a liquid glass morphism effect.
 * It includes animated gradients, ripple effects, and hover animations
 * with glass-like transparency and backdrop blur.
 */
import React from 'react';
import { Button, ButtonProps, alpha } from '@mui/material';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { motion } from 'framer-motion';

/**
 * Liquid Glass Variants
 * 
 * CSS variant configurations for liquid glass button styles.
 * Includes variant (default, primary, secondary, accent) and size options.
 */
const liquidGlassVariants = cva(
  "relative overflow-hidden transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30",
        primary: "bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-white hover:bg-blue-500/30 hover:border-blue-400/50",
        secondary: "bg-purple-500/20 backdrop-blur-md border border-purple-400/30 text-white hover:bg-purple-500/30 hover:border-purple-400/50",
        accent: "bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-white/20 text-white hover:from-purple-500/30 hover:to-blue-500/30",
      },
      size: {
        small: "px-3 py-1.5 text-sm rounded-lg",
        medium: "px-4 py-2 text-base rounded-xl", 
        large: "px-6 py-3 text-lg rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "medium",
    },
  }
);

/**
 * LiquidGlassButtonProps Interface
 * 
 * Props for the LiquidGlassButton component.
 */
interface LiquidGlassButtonProps extends Omit<ButtonProps, 'variant' | 'size'>, 
  VariantProps<typeof liquidGlassVariants> {
  children: React.ReactNode; // Button content
  className?: string; // Optional CSS class name
  glowColor?: string; // Optional glow color for custom effects
}

/**
 * Liquid Glass Button Component
 * 
 * Displays a button with liquid glass morphism effect with:
 * - Animated gradient backgrounds
 * - Ripple effect on click
 * - Glass-like transparency and backdrop blur
 * - Hover animations (scale, lift, shimmer)
 * - Multiple variants (default, primary, secondary, accent)
 * - Multiple sizes (small, medium, large)
 * - Framer Motion animations
 * 
 * This component is used throughout the application for
 * stylized action buttons.
 * 
 * @param {LiquidGlassButtonProps} props - Component props
 * @returns {JSX.Element} Liquid glass button with animations
 */
const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  children,
  className,
  variant = "default",
  size = "medium",
  glowColor,
  onClick,
  disabled,
  startIcon,
  endIcon,
  ...props
}) => {
  /**
   * Handle Click
   * 
   * Creates a ripple effect on button click and calls
   * the onClick callback if provided.
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Create ripple effect
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('div');
    
    const rippleSize = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - rippleSize / 2;
    const y = event.clientY - rect.top - rippleSize / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${rippleSize}px;
      height: ${rippleSize}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 600ms ease-out;
      pointer-events: none;
      z-index: 10;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        y: -2,
      }}
      whileTap={{ 
        scale: 0.98,
        y: 0,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      <Button
        {...props}
        onClick={handleClick}
        disabled={disabled}
        startIcon={startIcon}
        endIcon={endIcon}
      sx={{
        ...props.sx,
        position: 'relative',
        overflow: 'hidden',
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
        backdropFilter: 'blur(16px)',
        border: '1px solid',
        borderColor: alpha('#ffffff', 0.2),
        background: variant === 'accent' 
          ? 'linear-gradient(-45deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3), rgba(249, 115, 22, 0.3))'
          : variant === 'primary'
          ? 'linear-gradient(-45deg, rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))'
          : variant === 'secondary'
          ? 'linear-gradient(-45deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3), rgba(192, 132, 252, 0.3), rgba(139, 92, 246, 0.3))'
          : alpha('#ffffff', 0.1),
        backgroundSize: '400% 400%',
        animation: variant !== 'default' ? 'gradientFlow 3s ease infinite' : 'none',
        color: 'white',
        '&:hover': {
          background: variant === 'accent'
            ? 'linear-gradient(-45deg, rgba(147, 51, 234, 0.4), rgba(59, 130, 246, 0.4), rgba(168, 85, 247, 0.4), rgba(249, 115, 22, 0.4))'
            : variant === 'primary'
            ? 'linear-gradient(-45deg, rgba(59, 130, 246, 0.4), rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.4))'
            : variant === 'secondary'
            ? 'linear-gradient(-45deg, rgba(139, 92, 246, 0.4), rgba(168, 85, 247, 0.4), rgba(192, 132, 252, 0.4), rgba(139, 92, 246, 0.4))'
            : alpha('#ffffff', 0.2),
          backgroundSize: '400% 400%',
          animation: variant !== 'default' ? 'gradientFlow 2s ease infinite' : 'none',
          borderColor: alpha('#ffffff', 0.4),
          transform: 'translateY(-2px) scale(1.02)',
          boxShadow: '0 15px 50px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
        },
        '&:active': {
          transform: 'translateY(0px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
        },
        '&:disabled': {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          transition: 'left 0.5s ease',
          zIndex: 1,
        },
        '&:hover::before': {
          left: '100%',
        },
        '& .MuiButton-startIcon, & .MuiButton-endIcon': {
          zIndex: 2,
        },
        '& .MuiButton-label': {
          zIndex: 2,
        },
        // Ripple animation
        '@keyframes ripple': {
          '0%': {
            transform: 'scale(0)',
            opacity: 1,
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 0,
          },
        },
        // Flowing gradient animation
        '@keyframes gradientFlow': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
      }}
      className={clsx(liquidGlassVariants({ variant, size }), className)}
    >
        <span style={{ position: 'relative', zIndex: 2 }}>
          {children}
        </span>
      </Button>
    </motion.div>
  );
};

export default LiquidGlassButton;
