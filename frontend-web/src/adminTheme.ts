// src/adminTheme.ts
/**
 * Admin Theme Configuration
 * 
 * This file defines the Material-UI theme specifically for the admin panel.
 * It uses a dark theme with vibrant blue accents for a professional appearance.
 */
import { createTheme } from '@mui/material/styles';

/**
 * Admin Theme
 * 
 * A vibrant, professional dark theme configured for the admin panel.
 * Features:
 * - Dark mode with high contrast for better readability
 * - Vibrant blue (#3979F1) as primary color for actions
 * - Deep near-black backgrounds (#0A0A0A, #121212) for modern look
 * - Custom component overrides for Paper, Button, and Switch components
 * - Inter font family for clean, modern typography
 * 
 * @returns {Theme} Material-UI theme object for admin panel
 */
export const adminTheme = createTheme({
  // Color palette configuration
  palette: {
    mode: 'dark', // Dark theme mode
    primary: {
      main: '#3979F1', // A vibrant blue for primary actions and buttons
    },
    background: {
      default: '#0A0A0A', // A deep, near-black for high contrast main background
      paper: '#121212', // Slightly lighter background for cards and papers
    },
    text: {
      primary: '#FAFAFA', // Light text color for primary text
      secondary: '#B0B0B0', // Medium gray for secondary text
    },
    success: {
      main: '#4caf50', // Green color for success states
    },
    warning: {
      main: '#ff9800', // Orange color for warning states
    },
    divider: 'rgba(255, 255, 255, 0.12)', // Subtle white divider with 12% opacity
  },
  // Typography configuration
  typography: {
    // Font family fallback chain: Inter (preferred) -> Roboto -> Helvetica -> Arial -> sans-serif
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 }, // Bold weight for h4 headings
    h5: { fontWeight: 600 }, // Semi-bold weight for h5 headings
    h6: { fontWeight: 500 }, // Medium weight for h6 headings
  },
  // Component style overrides
  components: {
    // Paper component styling (used for cards and surfaces)
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default Material-UI gradient background
          border: '1px solid rgba(255, 255, 255, 0.12)', // Subtle border for definition
        },
      },
    },
    // Button component styling
    MuiButton: {
        styleOverrides: {
            contained: {
                fontWeight: 'bold', // Bold text for contained buttons
                textTransform: 'none', // Keep original text case (no uppercase)
                boxShadow: 'none', // Remove default shadow for flat appearance
            },
        }
    },
    // Switch component styling (toggle switches)
    MuiSwitch: {
        styleOverrides: {
            root: {
                width: 42, // Total switch width
                height: 26, // Total switch height
                padding: 0, // No padding on root
                // Switch base (the clickable area with thumb)
                '& .MuiSwitch-switchBase': {
                    padding: 0,
                    margin: 2, // Small margin for thumb positioning
                    transitionDuration: '300ms', // Smooth 300ms transition
                    // When switch is checked (ON state)
                    '&.Mui-checked': {
                        transform: 'translateX(16px)', // Move thumb 16px to the right
                        color: '#fff', // White thumb color
                        '& + .MuiSwitch-track': {
                            backgroundColor: '#4caf50', // Success Green when ON
                            opacity: 1,
                            border: 0, // No border
                        },
                    },
                },
                // Switch thumb (the circular slider)
                '& .MuiSwitch-thumb': {
                    boxSizing: 'border-box',
                    width: 22, // Thumb width
                    height: 22, // Thumb height
                },
                // Switch track (the background track)
                '& .MuiSwitch-track': {
                    borderRadius: 26 / 2, // Fully rounded track
                    backgroundColor: '#39393D', // Dark gray background when OFF
                    opacity: 1,
                },
            }
        }
    }
  },
});