// src/adminTheme.ts
/**
 * Admin Theme
 *
 * The admin panel's Material-UI theme, built from the system-wide
 * neutralDark tokens and darkTheme for complete visual cohesion.
 */
import { createTheme } from '@mui/material/styles';
import { neutralDark, fontBody, radius, touchTarget } from './themeTokens';
import { darkTheme } from './theme';

export const adminTheme = createTheme(darkTheme, {
  palette: {
    mode: 'dark',
    primary: { main: neutralDark.accentBase },
    background: { default: neutralDark.bg, paper: neutralDark.surface },
    text: { primary: neutralDark.text, secondary: neutralDark.textSecondary },
    success: { main: neutralDark.accent2Base },
    warning: { main: '#F59E0B' },
    divider: neutralDark.divider,
  },
  shape: {
    borderRadius: radius.container,
  },
  typography: {
    fontFamily: fontBody,
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${neutralDark.divider}`,
          borderRadius: radius.container,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          minHeight: touchTarget,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 40,
          height: 24,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 2,
            transitionDuration: '200ms',
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: neutralDark.accent2Base,
                opacity: 1,
                border: 0,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 20,
            height: 20,
          },
          '& .MuiSwitch-track': {
            borderRadius: 12,
            backgroundColor: neutralDark.surface2,
            opacity: 1,
          },
        },
      },
    },
  },
});

