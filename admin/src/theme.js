// admin/src/theme.js
'use client';
import { createTheme } from '@mui/material/styles';

// A professional, high-contrast dark theme inspired by Vercel's dashboard.
export const adminTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff', // White for primary actions
    },
    background: {
      default: '#000000', // True black for max contrast
      paper: '#111111',   // Off-black for paper elements
    },
    text: {
      primary: '#ffffff',
      secondary: '#888888', // A lighter grey for secondary text
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove gradients from MUI Paper
        },
        outlined: {
            borderColor: 'rgba(255, 255, 255, 0.12)'
        }
      },
    },
    MuiButton: {
        styleOverrides: {
            contained: {
                color: '#000',
                backgroundColor: '#fff',
                '&:hover': {
                    backgroundColor: '#e0e0e0',
                }
            },
            containedError: {
                color: '#fff',
                backgroundColor: '#f44336',
                 '&:hover': {
                    backgroundColor: '#d32f2f',
                }
            }
        }
    }
  },
});