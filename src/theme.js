// src/theme.js
import { createTheme, lighten, darken } from '@mui/material/styles';

// --- PALETTE 1: QUANTUM DARK (High-Contrast, Vercel-Inspired) ---
const QuantumDark = {
  background: '#000000',
  surface: '#121212',
  primaryText: '#FAFAFA',
  secondaryText: '#B0B0B0',
  border: 'rgba(255, 255, 255, 0.15)',
  accentBlue: '#0070F3',
  accentGreen: '#50E3C2',
  accentPink: '#f48fb1',
};

// --- START OF FIX: Refined Light Theme Palette ---
const QuantumLight = {
  background: '#F9FAFB',      // A soft, off-white background (almost grey)
  surface: '#FFFFFF',        // Pure white for cards to make them pop
  primaryText: '#1A1A1A',
  secondaryText: '#667085',    // A slightly softer grey for secondary text
  border: '#E5E7EB',         // A more visible, solid light-grey border
};
// --- END OF FIX ---

// Shared subject colors
export const subjectAccentColors = {
  chemistry: '#D32F2F',
  physics: QuantumDark.accentBlue,
  mathematics: '#F57C00',
  biology: '#388E3C',
  gk: '#FBC02D',
  homibhabha: QuantumDark.accentPink,
  default: QuantumDark.accentBlue,
};

// DARK THEME (Unchanged)
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
    // Accent palettes
    chemistryAccent: { main: subjectAccentColors.chemistry, light: lighten(subjectAccentColors.chemistry, 0.2), dark: darken(subjectAccentColors.chemistry, 0.1), contrastText: '#ffffff' },
    physicsAccent: { main: subjectAccentColors.physics, light: lighten(subjectAccentColors.physics, 0.2), dark: darken(subjectAccentColors.physics, 0.1), contrastText: '#ffffff' },
    mathematicsAccent: { main: subjectAccentColors.mathematics, light: lighten(subjectAccentColors.mathematics, 0.2), dark: darken(subjectAccentColors.mathematics, 0.1), contrastText: '#ffffff' },
    biologyAccent: { main: subjectAccentColors.biology, light: lighten(subjectAccentColors.biology, 0.2), dark: darken(subjectAccentColors.biology, 0.1), contrastText: '#ffffff' },
    gkAccent: { main: subjectAccentColors.gk, light: lighten(subjectAccentColors.gk, 0.2), dark: darken(subjectAccentColors.gk, 0.1), contrastText: '#000000' },
    challengesAccent: { main: '#9575CD', light: lighten('#9575CD', 0.2), dark: darken('#9575CD', 0.15), contrastText: '#ffffff' },
    friendsAccent: { main: '#64B5F6', light: lighten('#64B5F6', 0.2), dark: darken('#64B5F6', 0.15), contrastText: '#000000' },
    accountAccent: { main: '#81C784', light: lighten('#81C784', 0.2), dark: darken('#81C784', 0.15), contrastText: '#000000' },
    aboutAccent: { main: '#FFA000', light: lighten('#FFA000', 0.2), dark: darken('#FFA000', 0.15), contrastText: '#000000' },
    resultsAccent: { main: '#4DB6AC', light: lighten('#4DB6AC', 0.2), dark: darken('#4DB6AC', 0.15), contrastText: '#000000' },
    dashboardAccent: { main: '#757575', light: lighten('#757575', 0.2), dark: darken('#757575', 0.15), contrastText: '#ffffff' },
    aiCenterAccent: { main: '#00BFA5', light: lighten('#00BFA5', 0.2), dark: darken('#00BFA5', 0.15), contrastText: '#000000' },
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', h3: { fontWeight: 700 }, h4: { fontWeight: 700 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 } },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { border: `1px solid ${QuantumDark.border}`, backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#111111', boxShadow: 'none', borderBottom: `1px solid ${QuantumDark.border}` },
      },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: '8px' } },
    },
  },
});

// LIGHT THEME (Refined)
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
    // Accent palettes
    chemistryAccent: { main: subjectAccentColors.chemistry, light: lighten(subjectAccentColors.chemistry, 0.2), dark: darken(subjectAccentColors.chemistry, 0.1), contrastText: '#ffffff' },
    physicsAccent: { main: subjectAccentColors.physics, light: lighten(subjectAccentColors.physics, 0.2), dark: darken(subjectAccentColors.physics, 0.1), contrastText: '#ffffff' },
    mathematicsAccent: { main: subjectAccentColors.mathematics, light: lighten(subjectAccentColors.mathematics, 0.2), dark: darken(subjectAccentColors.mathematics, 0.1), contrastText: '#ffffff' },
    biologyAccent: { main: subjectAccentColors.biology, light: lighten(subjectAccentColors.biology, 0.2), dark: darken(subjectAccentColors.biology, 0.1), contrastText: '#ffffff' },
    gkAccent: { main: subjectAccentColors.gk, light: lighten(subjectAccentColors.gk, 0.2), dark: darken(subjectAccentColors.gk, 0.1), contrastText: '#000000' },
    challengesAccent: { main: '#8E24AA', light: lighten('#8E24AA', 0.2), dark: darken('#8E24AA', 0.15), contrastText: '#ffffff' },
    friendsAccent: { main: '#1976D2', light: lighten('#1976D2', 0.2), dark: darken('#1976D2', 0.15), contrastText: '#ffffff' },
    accountAccent: { main: '#388E3C', light: lighten('#388E3C', 0.2), dark: darken('#388E3C', 0.15), contrastText: '#ffffff' },
    aboutAccent: { main: '#F57C00', light: lighten('#F57C00', 0.2), dark: darken('#F57C00', 0.15), contrastText: '#ffffff' },
    resultsAccent: { main: '#00796B', light: lighten('#00796B', 0.2), dark: darken('#00796B', 0.15), contrastText: '#ffffff' },
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
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)', // A much softer shadow
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          boxShadow: 'none',
          borderBottom: `1px solid ${QuantumLight.border}`,
          color: QuantumLight.primaryText,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: '8px', boxShadow: 'none' },
      },
    },
  },
});