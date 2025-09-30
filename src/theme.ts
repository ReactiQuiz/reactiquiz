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
    MuiPaper: { 
      styleOverrides: { 
        root: { 
          border: `1px solid ${QuantumDark.border}`, 
          backgroundImage: 'none', 
          backgroundColor: QuantumDark.surface 
        } 
      } 
    },
    MuiCard: { 
      styleOverrides: { 
        root: { 
          border: `1px solid ${QuantumDark.border}`, 
          backgroundColor: '#0F0F0F', 
          boxShadow: 'none' 
        } 
      } 
    },
    MuiAppBar: { 
      styleOverrides: { 
        root: { 
          backgroundColor: '#0D0D0D', 
          boxShadow: 'none', 
          borderBottom: `1px solid ${QuantumDark.border}` 
        } 
      } 
    },
    MuiButton: { 
      styleOverrides: { 
        root: { 
          textTransform: 'none', 
          fontWeight: 700, 
          borderRadius: '10px' 
        } 
      } 
    },
    MuiInputBase: { 
      styleOverrides: { 
        root: { 
          backgroundColor: '#0F0F0F' 
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
