// src/theme.js
import { createTheme } from '@mui/material/styles';

const QuantumDark = {
  background: '#000000',
  surface: '#121212',
  primaryText: '#FAFAFA',
  secondaryText: '#B0B0B0',
  border: 'rgba(255, 255, 255, 0.30)',
  accentBlue: '#0070F3',
  accentGreen: '#50E3C2',
  accentPink: '#f48fb1',
};

const QuantumLight = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  primaryText: '#1A1A1A',
  secondaryText: '#667085',
  border: '#E5E7EB',
};

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
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', h3: { fontWeight: 700 }, h4: { fontWeight: 700 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 } },
  components: {
    MuiPaper: { styleOverrides: { root: { border: `1px solid ${QuantumDark.border}`, backgroundImage: 'none' } } },
    MuiAppBar: { styleOverrides: { root: { backgroundColor: '#111111', boxShadow: 'none', borderBottom: `1px solid ${QuantumDark.border}` } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: '8px' } } },
  },
});

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
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', h3: { fontWeight: 700, color: QuantumLight.primaryText }, h4: { fontWeight: 700, color: QuantumLight.primaryText }, h5: { fontWeight: 600, color: QuantumLight.primaryText }, h6: { fontWeight: 600, color: QuantumLight.primaryText } },
  components: {
    MuiPaper: { styleOverrides: { root: { border: `1px solid ${QuantumLight.border}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' } } },
    MuiAppBar: { styleOverrides: { root: { backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', boxShadow: 'none', borderBottom: `1px solid ${QuantumLight.border}`, color: QuantumLight.primaryText } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: '8px', boxShadow: 'none' } } },
  },
});