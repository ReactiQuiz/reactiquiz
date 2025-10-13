// src/components/home/AboutSummarySection.tsx
import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import LiquidGlassButton from '../animations/LiquidGlassButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import QuizIcon from '@mui/icons-material/Quiz';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function AboutSummarySection() {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 },
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
        backdropFilter: 'blur(10px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center relative z-10">
            {/* Header with icon */}
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 p-1 shadow-2xl">
                  <div className="w-full h-full bg-slate-900/90 rounded-xl flex items-center justify-center backdrop-blur">
                    <QuizIcon sx={{ fontSize: 40, color: '#60a5fa' }} />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <AutoAwesomeIcon sx={{ fontSize: 16, color: 'white' }} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 4,
                  letterSpacing: '-0.02em',
                }}
              >
                What is ReactiQuiz?
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.375rem' },
                  maxWidth: '900px',
                  mx: 'auto',
                  mb: 6,
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.7,
                  fontWeight: 400,
                }}
              >
                ReactiQuiz is a{' '}
                <span 
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 600,
                  }}
                >
                  dynamic and engaging
                </span>{' '}
                quiz application designed to help users test and improve their knowledge across various subjects. Whether you're preparing for exams, looking to learn something new, or just want to challenge yourself, ReactiQuiz offers a{' '}
                <span 
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 600,
                  }}
                >
                  rich and interactive experience
                </span>.
              </Typography>
            </motion.div>

            {/* Feature highlights */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              viewport={{ once: true }}
            >
              {[
                { icon: SchoolIcon, title: 'Learn', desc: 'Comprehensive subjects' },
                { icon: QuizIcon, title: 'Practice', desc: 'Interactive quizzes' },
                { icon: AutoAwesomeIcon, title: 'Excel', desc: 'Track your progress' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3">
                    <item.icon sx={{ fontSize: 24, color: 'white' }} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-300 text-sm text-center">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <LiquidGlassButton
                variant="accent"
                size="large"
                endIcon={
                  <div className="animate-x-oscillate">
                    <ArrowForwardIcon />
                  </div>
                }
                onClick={() => navigate('/about')}
                sx={{
                  py: 3,
                  px: 8,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                }}
              >
                Learn More About Us
              </LiquidGlassButton>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </Box>
  );
}

export default AboutSummarySection;