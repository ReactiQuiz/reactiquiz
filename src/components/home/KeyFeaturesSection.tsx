// src/components/home/KeyFeaturesSection.tsx
import React, { useState } from 'react';
import { Box, Typography, Grid, Container, CardContent, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { AnimatedSection, StaggeredContainer, fadeInUp } from '../animations/AnimationUtils';
import { HoverCard, GlowCard } from '../animations/AnimatedCard';
import { SecondaryAnimatedButton } from '../animations/AnimatedButton';
import QuizIcon from '@mui/icons-material/Quiz';
import TuneIcon from '@mui/icons-material/Tune';
import TimerIcon from '@mui/icons-material/Timer';
import InsightsIcon from '@mui/icons-material/Insights';
import HistoryIcon from '@mui/icons-material/History';
import GroupsIcon from '@mui/icons-material/Groups';
import StyleIcon from '@mui/icons-material/Style';
import DevicesIcon from '@mui/icons-material/Devices';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { alpha } from '@mui/material/styles';

const features = [
  { iconName: QuizIcon, title: "Diverse Quizzes", description: "Test your knowledge across Physics, Chemistry, Biology, Mathematics, and General Knowledge." },
  { iconName: TuneIcon, title: "Customizable Experience", description: "Tailor quizzes by selecting difficulty levels and the number of questions to fit your study needs." },
  { iconName: TimerIcon, title: "Timed Challenges", description: "Simulate exam conditions with timed quizzes, especially for Homi Bhabha preparation." },
  { iconName: InsightsIcon, title: "Instant Feedback", description: "Receive immediate results with scores, percentages, and detailed explanations for every answer." },
  { iconName: HistoryIcon, title: "Track Your Progress", description: "Monitor your learning journey with a persistent history of all your quiz attempts." },
  { iconName: GroupsIcon, title: "Friends & Challenges", description: "Connect with friends, send challenges, and compete to make learning more interactive." },
  { iconName: StyleIcon, title: "Flashcard Study Mode", description: "Review questions and answers effectively using the integrated flashcards feature." },
  { iconName: DevicesIcon, title: "Responsive Design", description: "Enjoy a seamless experience on any device, whether desktop, tablet, or mobile." }
];

const INITIAL_FEATURES_TO_SHOW = 4; // Show 4 initially for better balance with 4-col layout

function KeyFeaturesSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const handleToggleFeatures = () => {
    setShowAllFeatures(!showAllFeatures);
  };

  // Enhanced card appearance with better visual hierarchy

  const renderFeatureCard = (feature, index) => {
    const IconComponent = feature.iconName;
    const isSpecialCard = index < 2; // First two cards get glow effect
    const CardComponent = isSpecialCard ? GlowCard : HoverCard;
    
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ display: 'flex' }}>
        <CardComponent
          elevation={0}
          glowColor={isSpecialCard ? theme.palette.primary.main : undefined}
          sx={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.9)} 0%, 
              ${alpha(theme.palette.primary.main, 0.02)} 100%
            )`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%'
            }
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2.5, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              height: '100%'
            }}
          >
            {/* Animated Icon Container */}
            <motion.div
              whileHover={{ 
                rotate: [0, -10, 10, 0],
                scale: 1.1,
                transition: { duration: 0.5 }
              }}
              style={{
                marginBottom: theme.spacing(2),
                padding: theme.spacing(2),
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              <IconComponent 
                sx={{ 
                  fontSize: { xs: 32, sm: 40 }, 
                  color: theme.palette.primary.main,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }} 
              />
            </motion.div>
            
            {/* Animated Title */}
            <Typography 
              variant="h6" 
              component="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '1rem', sm: '1.1rem' }, 
                color: theme.palette.text.primary,
                mb: 1.5,
                position: 'relative'
              }}
            >
              {feature.title}
            </Typography>
            
            {/* Description with subtle animation */}
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.85rem', sm: '0.875rem' }, 
                lineHeight: 1.6,
                flexGrow: 1,
                opacity: 0.8
              }}
            >
              {feature.description}
            </Typography>
            
            {/* Subtle accent line */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '30px' }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{
                height: 2,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: 1,
                marginTop: theme.spacing(1.5)
              }}
            />
          </CardContent>
        </CardComponent>
      </Grid>
    );
  };

  return (
    <Box sx={{ 
      py: { xs: 6, sm: 8 },
      background: `linear-gradient(180deg, 
        ${alpha(theme.palette.background.default, 0.5)} 0%, 
        ${alpha(theme.palette.primary.main, 0.02)} 50%,
        ${alpha(theme.palette.background.default, 0.5)} 100%
      )`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <motion.div
        animate={{
          rotate: [0, 360],
          transition: { duration: 50, repeat: Infinity, ease: "linear" }
        }}
        style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: isMobile ? 200 : 300,
          height: isMobile ? 200 : 300,
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 0
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Title with Animation */}
        <AnimatedSection variants={fadeInUp}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 2
              }}
            >
              Packed with Features
            </Typography>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '80px' }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: 2,
                margin: '0 auto 16px'
              }}
            />
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                maxWidth: '500px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Discover the powerful tools that make learning engaging and effective
            </Typography>
          </Box>
        </AnimatedSection>

        {/* Features Grid with Staggered Animation */}
        <StaggeredContainer>
          <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
            {features.slice(0, INITIAL_FEATURES_TO_SHOW).map((feature, index) => (
              renderFeatureCard(feature, `initial-${index}`)
            ))}
          </Grid>
        </StaggeredContainer>

        {/* Collapsible Extra Features */}
        <motion.div
          initial={false}
          animate={{ 
            height: showAllFeatures ? 'auto' : 0,
            opacity: showAllFeatures ? 1 : 0
          }}
          transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
          style={{ overflow: 'hidden' }}
        >
          <StaggeredContainer delay={0.2}>
            <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center" sx={{ mt: { xs: 2, md: 3 } }}>
              {features.slice(INITIAL_FEATURES_TO_SHOW).map((feature, index) => (
                renderFeatureCard(feature, `more-${index}`)
              ))}
            </Grid>
          </StaggeredContainer>
        </motion.div>

        {/* Toggle Button with Animation */}
        {features.length > INITIAL_FEATURES_TO_SHOW && (
          <AnimatedSection delay={0.6}>
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SecondaryAnimatedButton
                  onClick={handleToggleFeatures}
                  animationType="bounce"
                  size="large"
                  startIcon={
                    <motion.div
                      animate={{ rotate: showAllFeatures ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ExpandMoreIcon />
                    </motion.div>
                  }
                  sx={{ 
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      color: theme.palette.primary.dark,
                      borderWidth: 2,
                      background: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {showAllFeatures ? 'Show Less Features' : 'Explore All Features'}
                </SecondaryAnimatedButton>
              </motion.div>
            </Box>
          </AnimatedSection>
        )}
      </Container>
    </Box>
  );
}

export default KeyFeaturesSection;