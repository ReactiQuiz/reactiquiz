// src/pages/AboutPage.tsx
/**
 * About Page
 *
 * Matched from About.dc.html: a kicker tag + Caprasimo h1, a row of stat
 * circles-turned-cards, and a "what we believe" card row with colored top
 * borders — wrapping the richer real content (mission, features, tech
 * stack, creator profile) this app actually has.
 */
import React from 'react';
import { Box, Typography, Container, Divider, Card, Grid } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import QuizIcon from '@mui/icons-material/Quiz';
import DevicesIcon from '@mui/icons-material/Devices';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CreatorProfile from '../components/about/CreatorProfile';

const STATS = [
  { value: '40k+', label: 'practice questions' },
  { value: '6–10', label: 'classes covered' },
  { value: '2025', label: 'founded' },
];

const BELIEFS = [
  { title: 'Feedback beats grades', body: 'Knowing why an answer is wrong matters far more than the final score itself.', border: 'primary.main' },
  { title: 'Practice should adapt', body: 'Topics and question sets should adjust to the student, creating a personalized learning pace.', border: 'secondary.main' },
  { title: 'Mastery through practice', body: 'Step-by-step problem solving builds deep subject confidence for exams.', border: 'primary.dark' },
];

const FEATURES = [
  { title: 'Interactive Quizzes', desc: 'Comprehensive quiz system with instant answer checking and solution explanations.', icon: QuizIcon },
  { title: 'Performance Analytics', desc: 'Real-time score tracking, subject analytics, and overall accuracy trends.', icon: AnalyticsIcon },
  { title: 'Competitive Prep', desc: 'Specialized Homi Bhabha practice tests designed for competitive science exams.', icon: SchoolIcon },
  { title: 'Cross-Device Design', desc: 'Responsive interface optimized seamlessly for desktop, tablet, and mobile.', icon: DevicesIcon },
  { title: 'Adaptive Theme Modes', desc: 'Comfortable light and dark theme support tailored for extended study sessions.', icon: DarkModeIcon },
  { title: 'Offline PDF Downloads', desc: 'Export practice papers and solution sheets to PDF for offline studying.', icon: PictureAsPdfIcon },
];

const AboutPage: React.FC = () => {
  return (
    <Box sx={{ py: { xs: 5, md: 7 }, width: '100%' }}>
      <Container maxWidth="md">
        <Typography variant="overline" sx={{ bgcolor: 'primary.main', color: (t) => t.palette.getContrastText(t.palette.primary.main), px: 1.5, py: 0.5, borderRadius: 999, display: 'inline-block', mb: 2, fontWeight: 700 }}>
          About us
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: '2.1rem', sm: '2.9rem' }, maxWidth: '18ch', mb: 2, fontWeight: 800 }}>
          Learning that meets you where you are.
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.0625rem', maxWidth: '65ch', color: 'text.secondary', mb: 5, lineHeight: 1.7 }}>
          ReactiQuiz was founded in 2025 with a simple goal: practice should feel structured, interactive, and empowering.
          We provide high-quality practice quizzes and mock tests for students in classes 6 through 10, across Science,
          Mathematics, and General Knowledge — with instant, detailed performance feedback on every question.
        </Typography>

        {/* Stats Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 6 }}>
          {STATS.map((s) => (
            <Card key={s.label} sx={{ textAlign: 'center', p: 3, borderRadius: 3, border: theme => `1px solid ${theme.palette.divider}` }}>
              <Typography sx={{ fontWeight: 800, fontSize: 36, color: 'primary.main' }}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{s.label}</Typography>
            </Card>
          ))}
        </Box>

        {/* What We Believe */}
        <Typography variant="h2" sx={{ fontSize: '1.6rem', mb: 3, fontWeight: 700 }}>What we believe</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3, mb: 6 }}>
          {BELIEFS.map((b) => (
            <Card key={b.title} sx={{ p: 3, borderRadius: 3, borderTop: '4px solid', borderColor: b.border, borderLeft: theme => `1px solid ${theme.palette.divider}`, borderRight: theme => `1px solid ${theme.palette.divider}`, borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" sx={{ fontSize: 17, mb: 1, fontWeight: 700 }}>{b.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{b.body}</Typography>
            </Card>
          ))}
        </Box>

        <CreatorProfile />

        {/* Our Mission */}
        <Box sx={{ my: 5 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', mb: 2, fontWeight: 700 }}>Our mission</Typography>
          <Typography paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'text.secondary' }}>
            Our mission is to empower students in classes 6th to 10th with accessible, accurate, and engaging quiz preparation tools. We continuously enhance ReactiQuiz by adding curated syllabus topics, rigorous question banks, and actionable analytics to foster student success.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Key Features Grid */}
        <Box sx={{ my: 5 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', mb: 3, fontWeight: 700 }}>Key features</Typography>
          <Grid container spacing={2.5}>
            {FEATURES.map((f) => {
              const IconComp = f.icon;
              return (
                <Grid item xs={12} sm={6} key={f.title}>
                  <Card sx={{ p: 2.5, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'flex-start', border: theme => `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: theme => alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex' }}>
                      <IconComp fontSize="medium" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{f.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>{f.desc}</Typography>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Technology Stack */}
        <Box sx={{ my: 5 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', mb: 2, fontWeight: 700 }}>Technology stack</Typography>
          <Typography paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'text.secondary' }}>
            ReactiQuiz is built using state-of-the-art web technologies including React, TypeScript, Material-UI, Node.js,
            Express.js, and Turso distributed database for fast, reliable data synchronization across devices.
          </Typography>
        </Box>

        {/* Contact Callout */}
        <Card sx={{ p: 3.5, borderRadius: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, border: theme => `1px solid ${theme.palette.primary.main}`, bgcolor: theme => alpha(theme.palette.primary.main, 0.04) }}>
          <Box>
            <Typography variant="h6" sx={{ fontSize: 19, fontWeight: 700 }}>Have questions or suggestions?</Typography>
            <Typography variant="body2" color="text.secondary">We would love to hear your feedback.</Typography>
          </Box>
          <Typography component={RouterLink} to="/contact" sx={{ px: 3, py: 1.25, borderRadius: 999, bgcolor: 'primary.main', color: (t) => t.palette.getContrastText(t.palette.primary.main), fontWeight: 700, textDecoration: 'none', transition: 'transform 150ms ease', '&:hover': { transform: 'scale(1.02)' } }}>
            Contact us
          </Typography>
        </Card>
      </Container>
    </Box>
  );
};

export default AboutPage;
