// src/theme.ts
import { createTheme, Theme } from '@mui/material/styles';

interface ColorPalette {
  background: string;
  surface: string;
  primaryText: string;
  secondaryText: string;
  border: string;
  accentBlue: string;
  accentGreen: string;
  accentPink: string;
  accentOrange: string;
}

interface LightColorPalette {
  background: string;
  surface: string;
  primaryText: string;
  secondaryText: string;
  border: string;
}

const QuantumDark: ColorPalette = {
  background: '#0A0A0A',
  surface: '#111111',
  primaryText: '#F5F7FA',
  secondaryText: '#C2C8D0',
  border: 'rgba(255, 255, 255, 0.16)',
  accentBlue: '#0070F3',
  accentGreen: '#17C964',
  accentPink: '#F31260',
  accentOrange: '#F5A524',
};

const QuantumLight: LightColorPalette = {
  background: '#F6F7F9',
  surface: '#FFFFFF',
  primaryText: '#0A0A0A',
  secondaryText: '#475467',
  border: '#E4E7EC',
};

export const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: QuantumDark.accentBlue },
    secondary: { main: QuantumDark.accentPink },
    background: { default: QuantumDark.background, paper: QuantumDark.surface },
    text: { primary: QuantumDark.primaryText, secondary: QuantumDark.secondaryText },
    divider: QuantumDark.border,
    error: { main: '#F44336' },
    success: { main: QuantumDark.accentGreen },
    warning: { main: QuantumDark.accentOrange },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: QuantumDark.background, color: QuantumDark.primaryText },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 8 },
      },
    },
    // Glassmorphism surfaces
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `1px solid ${QuantumDark.border}`,
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
          backgroundColor: 'rgba(15,15,15,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${QuantumDark.border}`,
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
          backgroundColor: 'rgba(16,16,16,0.55)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.45)',
            borderColor: 'rgba(255,255,255,0.24)'
          }
        }
      }
    },
    MuiAppBar: { 
      styleOverrides: { 
        root: { 
          backgroundColor: 'rgba(10,10,10,0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
          borderBottom: `1px solid ${QuantumDark.border}` 
        } 
      } 
    },
    MuiButton: { 
      styleOverrides: { 
        root: { 
          textTransform: 'none', 
          fontWeight: 700, 
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
          backgroundColor: 'rgba(20,20,20,0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: `1px solid ${QuantumDark.border}`,
          boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
          transition: 'transform .15s ease, box-shadow .15s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 26px rgba(0,0,0,0.45)'
          },
          '&:active': {
            transform: 'translateY(0) scale(0.98)'
          }
        } 
      } 
    },
    MuiInputBase: { 
      styleOverrides: { 
        root: { 
          backgroundColor: 'rgba(12,12,12,0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        } 
      } 
    },
    MuiOutlinedInput: { 
      styleOverrides: { 
        notchedOutline: { 
          borderColor: QuantumDark.border 
        } 
      } 
    },
    MuiDivider: { 
      styleOverrides: { 
        root: { 
          borderColor: QuantumDark.border 
        } 
      } 
    },
  },
});

export const lightTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: QuantumDark.accentBlue },
    secondary: { main: QuantumDark.accentPink },
    background: { default: QuantumLight.background, paper: QuantumLight.surface },
    text: { primary: QuantumLight.primaryText, secondary: QuantumLight.secondaryText },
    divider: QuantumLight.border,
    error: { main: '#D32F2F' },
    success: { main: '#1B5E20' },
    warning: { main: '#B26A00' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 800, color: QuantumLight.primaryText },
    h4: { fontWeight: 800, color: QuantumLight.primaryText },
    h5: { fontWeight: 700, color: QuantumLight.primaryText },
    h6: { fontWeight: 700, color: QuantumLight.primaryText },
    button: { fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: QuantumLight.background, color: QuantumLight.primaryText },
      },
    },
    MuiPaper: { 
      styleOverrides: { 
        root: { 
          border: `1px solid ${QuantumLight.border}`, 
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)', 
          backgroundColor: QuantumLight.surface 
        } 
      } 
    },
    MuiCard: { 
      styleOverrides: { 
        root: { 
          border: `1px solid ${QuantumLight.border}`, 
          backgroundColor: QuantumLight.surface, 
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)' 
        } 
      } 
    },
    MuiAppBar: { 
      styleOverrides: { 
        root: { 
          backgroundColor: '#FFFFFF', 
          boxShadow: 'none', 
          borderBottom: `1px solid ${QuantumLight.border}`, 
          color: QuantumLight.primaryText 
        } 
      } 
    },
    MuiButton: { 
      styleOverrides: { 
        root: { 
          textTransform: 'none', 
          fontWeight: 700, 
          borderRadius: '10px', 
          boxShadow: 'none' 
        } 
      } 
    },
    MuiOutlinedInput: { 
      styleOverrides: { 
        notchedOutline: { 
          borderColor: QuantumLight.border 
        } 
      } 
    },
    MuiDivider: { 
      styleOverrides: { 
        root: { 
          borderColor: QuantumLight.border 
        } 
      } 
    },
  },
});
