import { createTheme } from '@mui/material/styles';
import { lighten } from '@mui/material/styles';

export const subjectAccentColors = {
  chemistry: '#f44336',
  physics: '#2196f3',
  mathematics: '#ff9800',
  biology: '#4caf50',
  gk: '#FFEB3B',
  default: '#90caf9',
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
      dark: lighten(subjectAccentColors.chemistry, 0.1),
      contrastText: '#ffffff',
    },
    physicsAccent: {
      main: subjectAccentColors.physics,
      light: lighten(subjectAccentColors.physics, 0.2),
      dark: lighten(subjectAccentColors.physics, 0.1),
      contrastText: '#ffffff',
    },
    mathematicsAccent: {
      main: subjectAccentColors.mathematics,
      light: lighten(subjectAccentColors.mathematics, 0.2),
      dark: lighten(subjectAccentColors.mathematics, 0.1),
      contrastText: '#000000',
    },
    biologyAccent: {
      main: subjectAccentColors.biology,
      light: lighten(subjectAccentColors.biology, 0.2),
      dark: lighten(subjectAccentColors.biology, 0.1),
      contrastText: '#ffffff',
    },
    gkAccent: {
      main: subjectAccentColors.gk,
      light: lighten(subjectAccentColors.gk, 0.2),
      dark: lighten(subjectAccentColors.gk, 0.1),
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