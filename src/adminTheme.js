// src/adminTheme.js
import { createTheme } from '@mui/material/styles';

// A vibrant, professional dark theme for the admin panel.
export const adminTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3979F1', // A vibrant blue for primary actions
    },
    secondary: {
      main: '#9c27b0', // A rich purple for accents
    },
    background: {
      default: '#0A0A0A',
      paper: '#121212',
    },
    text: {
      primary: '#FAFAFA',
      secondary: '#B0B0B0',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
        main: '#ff9800',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiButton: {
        styleOverrides: {
            contained: {
                fontWeight: 'bold',
                textTransform: 'none',
            },
        }
    },
    MuiSwitch: {
        styleOverrides: {
            root: {
                width: 42,
                height: 26,
                padding: 0,
                '& .MuiSwitch-switchBase': {
                    padding: 0,
                    margin: 2,
                    transitionDuration: '300ms',
                    '&.Mui-checked': {
                        transform: 'translateX(16px)',
                        color: '#fff',
                        '& + .MuiSwitch-track': {
                            backgroundColor: '#4caf50', // Success Green
                            opacity: 1,
                            border: 0,
                        },
                    },
                },
                '& .MuiSwitch-thumb': {
                    boxSizing: 'border-box',
                    width: 22,
                    height: 22,
                },
                '& .MuiSwitch-track': {
                    borderRadius: 26 / 2,
                    backgroundColor: '#39393D',
                    opacity: 1,
                },
            }
        }
    }
  },
});