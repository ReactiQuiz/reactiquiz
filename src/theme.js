// src/theme.js
import { createTheme } from '@mui/material/styles';
import { lighten } from '@mui/material/styles';


// Define accent colors (can be centralized here or kept in respective pages)
export const subjectAccentColors = {
  chemistry: '#f44336', // A slightly brighter red
  physics: '#2196f3',   // A slightly brighter blue
  mathematics: '#ff9800', // A slightly brighter orange
  biology: '#4caf50',   // A slightly brighter green
  default: '#90caf9',   // Default primary for dark theme (light blue)
};

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: subjectAccentColors.default,
    },
    secondary: {
      main: '#f48fb1', // A light pink for secondary actions
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e', // For cards, dialogs, etc.
    },
    text: {
      primary: '#e0e0e0', // Lighter grey for primary text
      secondary: '#b0bec5', // Even lighter grey for secondary text
    },
    // Specific accent colors accessible via theme if needed elsewhere
    chemistryAccent: {
      main: subjectAccentColors.chemistry,
      light: lighten(subjectAccentColors.chemistry, 0.2),
      dark: lighten(subjectAccentColors.chemistry, 0.1), // Darken will be too dark on dark bg
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
      contrastText: '#000000', // Orange might need dark text
    },
    biologyAccent: {
      main: subjectAccentColors.biology,
      light: lighten(subjectAccentColors.biology, 0.2),
      dark: lighten(subjectAccentColors.biology, 0.1),
      contrastText: '#ffffff',
    },
    error: {
        main: '#f44336', // Standard MUI error red
    },
    success: {
        main: '#66bb6a', // Standard MUI success green
    },
    info: {
        main: '#29b6f6', // Standard MUI info blue
    },
    warning: {
        main: '#ffa726', // Standard MUI warning orange
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
    // Ensure default body text is legible
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
          // backgroundColor will be set by palette.background.paper
          // You can add other paper defaults here if needed
        },
      },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                textTransform: 'none', // Keep button text case as defined
            }
        }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#272727', // A slightly different dark for app bar
        }
      }
    },
    MuiChip: {
        styleOverrides: {
            root: {
                // Ensure chips are legible on dark backgrounds
            }
        }
    }
  },
});