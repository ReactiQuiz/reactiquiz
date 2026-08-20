// src/components/animations/LiquidGlassButton.tsx
/**
 * "Liquid Glass" button — name kept for import-path stability across its six
 * callers, but the glassmorphism (purple/blue gradients, white-on-glass text)
 * has been replaced: it hardcoded white text on translucent dark glass, which
 * is invisible against the Organic system's cream ground. This is now a
 * pill-shaped Organic button with an Apple-style press spring.
 */
import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const liquidGlassVariants = cva('relative overflow-hidden transition-all duration-300 ease-out', {
  variants: {
    variant: {
      default: '',
      primary: '',
      secondary: '',
      accent: '',
    },
    size: {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'medium',
  },
});

interface LiquidGlassButtonProps extends Omit<ButtonProps, 'variant' | 'size'>,
  VariantProps<typeof liquidGlassVariants> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

const SIZE_PADDING: Record<string, string> = {
  small: '8px 16px',
  medium: '11px 22px',
  large: '14px 28px',
};

const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  children,
  className,
  variant = 'default',
  size = 'medium',
  onClick,
  disabled,
  startIcon,
  endIcon,
  ...props
}) => {
  const theme = useTheme();
  const fill = variant === 'secondary' ? theme.palette.secondary.main : theme.palette.primary.main;
  const isFilled = variant === 'primary' || variant === 'secondary' || variant === 'accent';

  return (
    <motion.div
      style={{ display: 'inline-block' }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
    >
      <Button
        {...props}
        onClick={onClick}
        disabled={disabled}
        startIcon={startIcon}
        endIcon={endIcon}
        sx={{
          ...props.sx,
          borderRadius: 1.5,
          textTransform: 'none',
          fontWeight: 600,
          padding: SIZE_PADDING[size || 'medium'],
          boxShadow: 'none',
          background: isFilled ? fill : 'transparent',
          border: isFilled ? 'none' : `1px solid ${theme.palette.divider}`,
          color: isFilled ? '#FFFFFF' : theme.palette.text.primary,
          transition: 'all 0.15s ease',
          '&:hover': {
            background: isFilled ? alpha(fill, 0.88) : alpha(theme.palette.text.primary, 0.05),
            borderColor: isFilled ? 'none' : theme.palette.text.secondary,
          },
          '&:disabled': {
            opacity: 0.45,
            cursor: 'not-allowed',
          },
        }}
        className={clsx(liquidGlassVariants({ variant, size }), className)}
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default LiquidGlassButton;
