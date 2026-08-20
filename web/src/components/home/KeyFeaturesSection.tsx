// src/components/home/KeyFeaturesSection.tsx
/**
 * Key Features Section
 *
 * Matched from Landing.dc.html's "What's inside" section — dot-marker
 * feature titles over plain copy, no cards, no glow. Replaces the previous
 * dark glassmorphism grid (gradient text, white-on-glass cards).
 */
import React from 'react';
import { Box, Typography, Container, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import QuizIcon from '@mui/icons-material/Quiz';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import StyleIcon from '@mui/icons-material/Style';

const FEATURES = [
  { title: 'Interactive Quizzes', desc: 'Pick a topic, answer at your own pace, and see instant explanations the moment you finish.', icon: QuizIcon },
  { title: 'Comprehensive Analytics', desc: 'Every quiz feeds your personal dashboard, tracking accuracy and performance trends over time.', icon: AnalyticsIcon },
  { title: 'Study Flashcards', desc: 'Turn any topic into an active recall deck — the fastest way to master key concepts and definitions before exams.', icon: StyleIcon },
  { title: 'Curriculum & Exam Focus', desc: 'Tailored practice sets covering classes 6 to 10 as well as competitive assessments like Homi Bhabha exams.', icon: DashboardIcon },
];

const KeyFeaturesSection: React.FC = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.06em' }}>
          What's inside
        </Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem' }, maxWidth: '20ch', mb: 5 }}>
          Everything you need, in one calm place
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, columnGap: 8, rowGap: 5 }}>
          {FEATURES.map((f, idx) => {
            const IconComp = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.06 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (t) => t.palette.mode === 'light' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(96, 165, 250, 0.12)',
                    color: 'primary.main',
                    flexShrink: 0
                  }}>
                    <IconComp fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ mb: 0.75, fontSize: '1.125rem' }}>{f.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: '44ch' }}>{f.desc}</Typography>
                  </Box>
                </Stack>
              </motion.div>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default KeyFeaturesSection;
