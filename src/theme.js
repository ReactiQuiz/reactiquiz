// src/theme.js
import { createTheme, lighten, darken } from '@mui/material/styles';

// --- PALETTE 1: QUANTUM DARK (High-Contrast, Vercel-Inspired) ---
const QuantumDark = {
  background: '#000000',      // Pure black for maximum depth
  surface: '#121212',        // A very dark grey for cards, creating a subtle lift
  primaryText: '#FAFAFA',      // Bright, off-white for high readability
  secondaryText: '#B0B0B0',    // Lighter grey for secondary info and icons
  border: 'rgba(255, 255, 255, 0.15)', // A slightly more defined border
  accentBlue: '#0070F3',      // Vibrant blue for primary actions
  accentGreen: '#50E3C2',      // Vibrant green for success
  accentPink: '#f48fb1',       // Homi Bhabha accent
};

// --- PALETTE 2: QUANTUM LIGHT (Clean & Professional White) ---
const QuantumLight = {
  background: '#FFFFFF',      // Pure white background
  surface: '#F7F9FC',        // A very light, cool grey for cards
  primaryText: '#1A1A1A',      // Dark charcoal for primary text (less harsh than pure black)
  secondaryText: '#666666',    // Standard grey for secondary text
  border: 'rgba(0, 0, 0, 0.12)', // Standard light theme border
};

// --- PRESERVED SUBJECT-SPECIFIC ACCENTS ---
// These are shared between themes
export const subjectAccentColors = {
  chemistry: '#D32F2F', // Slightly deeper red for better contrast on both themes
  physics: QuantumDark.accentBlue,
  mathematics: '#F57C00', // Deeper orange
  biology: '#388E3C', // Deeper green
  gk: '#FBC02D',     // Deeper yellow
  homibhabha: QuantumDark.accentPink,
  default: QuantumDark.accentBlue,
};

// --- THEME 1: DARK THEME EXPORT ---
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: QuantumDark.accentBlue },
    secondary: { main: QuantumDark.accentPink },
    background: { default: QuantumDark.background, paper: QuantumDark.surface },
    text: { primary: QuantumDark.primaryText, secondary: QuantumDark.secondaryText },
    divider: QuantumDark.border,
    error: { main: '#F44336' },
    success: { main: QuantumDark.accentGreen },
    // --- Page Accents ---
    chemistryAccent: { main: subjectAccentColors.chemistry, light: lighten(subjectAccentColors.chemistry, 0.2), dark: darken(subjectAccentColors.chemistry, 0.1), contrastText: '#ffffff' },
    physicsAccent: { main: subjectAccentColors.physics, light: lighten(subjectAccentColors.physics, 0.2), dark: darken(subjectAccentColors.physics, 0.1), contrastText: '#ffffff' },
    mathematicsAccent: { main: subjectAccentColors.mathematics, light: lighten(subjectAccentColors.mathematics, 0.2), dark: darken(subjectAccentColors.mathematics, 0.1), contrastText: '#ffffff' },
    biologyAccent: { main: subjectAccentColors.biology, light: lighten(subjectAccentColors.biology, 0.2), dark: darken(subjectAccentColors.biology, 0.1), contrastText: '#ffffff' },
    gkAccent: { main: subjectAccentColors.gk, light: lighten(subjectAccentColors.gk, 0.2), dark: darken(subjectAccentColors.gk, 0.1), contrastText: '#000000' },
    accountAccent: { main: '#81C784', light: lighten('#81C784', 0.2), dark: darken('#81C784', 0.15), contrastText: '#000000' },
    aboutAccent: { main: '#FFA000', light: lighten('#FFA000', 0.2), dark: darken('#FFA000', 0.15), contrastText: '#000000' },
    resultsAccent: { main: '#4DB6AC', light: lighten('#4DB6AC', 0.2), dark: darken('#4DB6AC', 0.15), contrastText: '#000000' },
    dashboardAccent: { main: '#757575', light: lighten('#757575', 0.2), dark: darken('#757575', 0.15), contrastText: '#ffffff' },
    aiCenterAccent: { main: '#00BFA5', light: lighten('#00BFA5', 0.2), dark: darken('#00BFA5', 0.15), contrastText: '#000000' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `1px solid ${QuantumDark.border}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#111111',
          boxShadow: 'none',
          borderBottom: `1px solid ${QuantumDark.border}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: '8px' },
      },
    },
  },
});

// --- THEME 2: LIGHT THEME EXPORT ---
// This theme is ready to be used when you implement your theme switcher.
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: QuantumDark.accentBlue },
    secondary: { main: QuantumDark.accentPink },
    background: { default: QuantumLight.background, paper: QuantumLight.surface },
    text: { primary: QuantumLight.primaryText, secondary: QuantumLight.secondaryText },
    divider: QuantumLight.border,
    error: { main: '#D32F2F' },
    success: { main: '#2E7D32' },
    // --- Page Accents ---
    chemistryAccent: { main: subjectAccentColors.chemistry, light: lighten(subjectAccentColors.chemistry, 0.2), dark: darken(subjectAccentColors.chemistry, 0.1), contrastText: '#ffffff' },
    physicsAccent: { main: subjectAccentColors.physics, light: lighten(subjectAccentColors.physics, 0.2), dark: darken(subjectAccentColors.physics, 0.1), contrastText: '#ffffff' },
    mathematicsAccent: { main: subjectAccentColors.mathematics, light: lighten(subjectAccentColors.mathematics, 0.2), dark: darken(subjectAccentColors.mathematics, 0.1), contrastText: '#ffffff' },
    biologyAccent: { main: subjectAccentColors.biology, light: lighten(subjectAccentColors.biology, 0.2), dark: darken(subjectAccentColors.biology, 0.1), contrastText: '#ffffff' },
    gkAccent: { main: subjectAccentColors.gk, light: lighten(subjectAccentColors.gk, 0.2), dark: darken(subjectAccentColors.gk, 0.1), contrastText: '#000000' },
    accountAccent: { main: '#388E3C', light: lighten('#388E3C', 0.2), dark: darken('#388E3C', 0.15), contrastText: '#ffffff' }, // Deeper green
    aboutAccent: { main: '#F57C00', light: lighten('#F57C00', 0.2), dark: darken('#F57C00', 0.15), contrastText: '#ffffff' }, // Deeper orange
    resultsAccent: { main: '#00796B', light: lighten('#00796B', 0.2), dark: darken('#00796B', 0.15), contrastText: '#ffffff' }, // Deeper teal
    dashboardAccent: { main: '#616161', light: lighten('#616161', 0.2), dark: darken('#616161', 0.15), contrastText: '#ffffff' },
    aiCenterAccent: { main: '#00897B', light: lighten('#00897B', 0.2), dark: darken('#00897B', 0.15), contrastText: '#ffffff' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 700, color: QuantumLight.primaryText },
    h4: { fontWeight: 700, color: QuantumLight.primaryText },
    h5: { fontWeight: 600, color: QuantumLight.primaryText },
    h6: { fontWeight: 600, color: QuantumLight.primaryText },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `1px solid ${QuantumLight.border}`,
        },
        elevation3: { // Add more defined shadow for light mode
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.85)', // Semi-transparent for a modern look
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: `1px solid ${QuantumLight.border}`,
          color: QuantumLight.primaryText,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: '8px' },
      },
    },
  },
});