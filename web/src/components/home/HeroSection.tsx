// src/components/home/HeroSection.tsx
/**
 * Hero Section Component
 *
 * The landing page's opening section — Organic's warm cream hero with two
 * soft decorative circles, matched from Landing.dc.html in the design
 * handoff. Replaces the previous space/particle-field hero, which hardcoded
 * white text and purple glow that don't work on a light, warm ground.
 */
import React from 'react';
import { Box, Typography, Container, Stack } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LiquidGlassButton from '../animations/LiquidGlassButton';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: 'easeOut' },
  }),
};

function HeroSection() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Soft decorative circles — Landing.dc.html hero */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute', right: -150, top: -150, width: 400, height: 400,
          borderRadius: '50%', background: alpha(theme.palette.secondary.main, 0.16),
          zIndex: 0, pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute', left: -90, bottom: 10, width: 150, height: 150,
          borderRadius: '50%', background: alpha(theme.palette.primary.main, 0.12),
          zIndex: 0, pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 12 } }}>
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <Typography
            component="h1"
            variant="h1"
            sx={{ fontSize: { xs: '2.75rem', sm: '3.75rem', md: '4.75rem' }, maxWidth: '20ch' }}
          >
            <Box component="span" sx={{ display: 'block' }}>Sharpen your mind,</Box>
            <Box component="span" sx={{ display: 'block' }}>one quiz at a time.</Box>
          </Typography>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={0.12} variants={fadeUp}>
          <Typography
            variant="body1"
            sx={{ fontSize: '1.0625rem', lineHeight: 1.75, maxWidth: '60ch', mt: 3, color: 'text.secondary' }}
          >
            ReactiQuiz is a focused place to practice what you're learning — thousands of questions across
            science, maths, and general knowledge for classes 6 to 12, with instant feedback, explanations, and flashcards.
          </Typography>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={0.22} variants={fadeUp}>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: 4, rowGap: 1.5 }}>
            <LiquidGlassButton
              variant="primary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/login')}
            >
              Start learning
            </LiquidGlassButton>
            <LiquidGlassButton
              variant="default"
              size="large"
              onClick={() => document.getElementById('subjects')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore subjects
            </LiquidGlassButton>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
}

export default HeroSection;
