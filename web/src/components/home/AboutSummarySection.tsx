// src/components/home/AboutSummarySection.tsx
/**
 * About Summary Section
 *
 * A calm, centered intro to ReactiQuiz — replaces the previous dark
 * glassmorphism version (purple/blue gradient text on a slate background),
 * which doesn't read on the Organic system's cream ground.
 */
import React from 'react';
import { Container, Box, Typography, Stack } from '@mui/material';
import LiquidGlassButton from '../animations/LiquidGlassButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PILLARS = [
  { icon: SchoolIcon, title: 'Learn', desc: 'Comprehensive subjects for classes 6–12' },
  { icon: QuizIcon, title: 'Practice', desc: 'Interactive quizzes with instant feedback' },
  { icon: AutoAwesomeIcon, title: 'Excel', desc: 'Track progress topic by topic' },
];

function AboutSummarySection() {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: { xs: 8, md: 10 } }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', sm: '2.6rem' } }}>
            What is ReactiQuiz?
          </Typography>
          <Typography variant="body1" sx={{ mt: 2.5, maxWidth: '65ch', mx: 'auto', color: 'text.secondary', fontSize: '1.0625rem' }}>
            A friendly quiz platform for students preparing for exams, brushing up on a subject, or just
            testing what they know. Thousands of questions across science, maths and general knowledge,
            with clear feedback the moment you finish.
          </Typography>
        </motion.div>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mt: 6 }}>
          {PILLARS.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Stack alignItems="center" spacing={1.25} sx={{ maxWidth: 200 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: i % 2 === 0 ? 'primary.main' : 'secondary.main' }}>
                  <p.icon sx={{ color: 'background.default', fontSize: 24 }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{p.title}</Typography>
                <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>{p.desc}</Typography>
              </Stack>
            </motion.div>
          ))}
        </Stack>

        <Box sx={{ mt: 6 }}>
          <LiquidGlassButton variant="default" size="medium" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/about')}>
            Learn more about us
          </LiquidGlassButton>
        </Box>
      </Container>
    </Box>
  );
}

export default AboutSummarySection;
