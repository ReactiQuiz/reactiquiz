// src/theme.js
import { createTheme, lighten, darken } from '@mui/material/styles';

export const subjectAccentColors = {
  chemistry: '#f44336',
  physics: '#2196f3',
  mathematics: '#ff9800',
  biology: '#4caf50',
  gk: '#FFEB3B',
  default: '#90caf9', // Used for primary
};

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: subjectAccentColors.default,
    },
    secondary: {
      main: '#f48fb1',
    },
    challengesAccent: {
      main: '#9575CD',
      light: lighten('#9575CD', 0.2),
      dark: darken('#9575CD', 0.15),
      contrastText: '#ffffff',
    },
    friendsAccent: {
      main: '#64B5F6',
      light: lighten('#64B5F6', 0.2),
      dark: darken('#64B5F6', 0.15),
      contrastText: '#000000',
    },
    accountAccent: {
      main: '#81C784',
      light: lighten('#81C784', 0.2),
      dark: darken('#81C784', 0.15),
      contrastText: '#000000',
    },
    aboutAccent: {
      main: '#FFA000',
      light: lighten('#FFA000', 0.2),
      dark: darken('#FFA000', 0.15),
      contrastText: '#000000',
    },
    resultsAccent: {
      main: '#4DB6AC',
      light: lighten('#4DB6AC', 0.2),
      dark: darken('#4DB6AC', 0.15),
      contrastText: '#000000',
    },
    dashboardAccent: { // New Dashboard Accent
      main: '#757575', // Grey 600
      light: lighten('#757575', 0.2),
      dark: darken('#757575', 0.15),
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0bec5',
    },
    chemistryAccent: {
      main: subjectAccentColors.chemistry,
      light: lighten(subjectAccentColors.chemistry, 0.2),
      dark: darken(subjectAccentColors.chemistry, 0.1),
      contrastText: '#ffffff',
    },
    physicsAccent: {
      main: subjectAccentColors.physics,
      light: lighten(subjectAccentColors.physics, 0.2),
      dark: darken(subjectAccentColors.physics, 0.1),
      contrastText: '#ffffff',
    },
    mathematicsAccent: {
      main: subjectAccentColors.mathematics,
      light: lighten(subjectAccentColors.mathematics, 0.2),
      dark: darken(subjectAccentColors.mathematics, 0.1),
      contrastText: '#000000',
    },
    biologyAccent: {
      main: subjectAccentColors.biology,
      light: lighten(subjectAccentColors.biology, 0.2),
      dark: darken(subjectAccentColors.biology, 0.1),
      contrastText: '#ffffff',
    },
    gkAccent: {
      main: subjectAccentColors.gk,
      light: lighten(subjectAccentColors.gk, 0.2),
      dark: darken(subjectAccentColors.gk, 0.1),
      contrastText: '#000000',
    },
    error: {
      main: '#f44336',
    },
    success: {
      main: '#66bb6a',
    },
    info: {
      main: '#29b6f6',
    },
    warning: {
      main: '#ffa726',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    body1: {
      color: '#e0e0e0',
    },
    body2: {
      color: '#b0bec5',
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {

        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#272727',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
        }
      }
    }
  },
});