// src/theme.ts
/**
 * Theme Configuration
 * 
 * This file defines Material-UI themes for the application. It provides three theme variants:
 * - darkTheme: Quantum dark theme with blue accents
 * - neonTheme: Neon dark theme with vibrant colors and glow effects
 * - lightTheme: Light theme with clean, modern colors
 * 
 * Each theme includes color palettes, typography settings, and component style overrides.
 */
import { createTheme, Theme } from '@mui/material/styles';

/**
 * ColorPalette Interface
 * 
 * Defines the color structure for dark themes (Quantum Dark and Neon Light).
 * Includes background colors, surface colors, text colors, borders, and accent colors.
 */
interface ColorPalette {
  background: string; // Main background color
  surface: string; // Card and paper background color
  primaryText: string; // Primary text color
  secondaryText: string; // Secondary text color
  border: string; // Border and divider color
  accentBlue: string; // Blue accent color
  accentGreen: string; // Green accent color
  accentPink: string; // Pink accent color
  accentOrange: string; // Orange accent color
}

/**
 * LightColorPalette Interface
 * 
 * Defines the color structure for light theme.
 * Uses a simplified palette without accent colors (uses standard Material-UI colors instead).
 */
interface LightColorPalette {
  background: string; // Main background color
  surface: string; // Card and paper background color
  primaryText: string; // Primary text color
  secondaryText: string; // Secondary text color
  border: string; // Border and divider color
}

/**
 * QuantumDark Color Palette
 * 
 * Dark theme color palette with deep blacks and vibrant accents.
 * Used for the main dark theme (darkTheme).
 */
const QuantumDark: ColorPalette = {
  background: '#0A0A0A', // Very dark near-black background
  surface: '#111111', // Slightly lighter dark surface for cards
  primaryText: '#F5F7FA', // Almost white text for high contrast
  secondaryText: '#C2C8D0', // Medium gray for secondary text
  border: 'rgba(255, 255, 255, 0.16)', // Subtle white border with 16% opacity
  accentBlue: '#0070F3', // Vibrant blue accent
  accentGreen: '#17C964', // Bright green accent
  accentPink: '#F31260', // Vibrant pink accent
  accentOrange: '#F5A524', // Warm orange accent
};

/**
 * QuantumLight Color Palette
 * 
 * Light theme color palette with soft grays and whites.
 * Used for the main light theme (lightTheme).
 */
const QuantumLight: LightColorPalette = {
  background: '#F6F7F9', // Light gray background
  surface: '#FFFFFF', // White surface for cards
  primaryText: '#0A0A0A', // Dark text for readability
  secondaryText: '#475467', // Medium gray for secondary text
  border: '#E4E7EC', // Light gray border
};

/**
 * NeonLight Color Palette
 * 
 * Neon dark theme color palette with vibrant colors and glow effects.
 * Used for the neon theme (neonTheme).
 */
const NeonLight: ColorPalette = {
  background: '#0F1021', // Deep dark blue background
  surface: '#171A36', // Dark blue surface for cards
  primaryText: '#FFFFFF', // White text
  secondaryText: '#B4B7C5', // Light gray text
  border: 'rgba(255, 255, 255, 0.12)', // Subtle white border
  accentBlue: '#4D61FC', // Bright neon blue
  accentGreen: '#00F5C0', // Cyan green accent
  accentPink: '#FF36AB', // Vibrant neon pink
  accentOrange: '#FFB800', // Bright neon orange
};

/**
 * Dark Theme
 * 
 * Quantum dark theme with deep blacks and vibrant blue accents.
 * Features high contrast for better readability and modern aesthetic.
 * 
 * @returns {Theme} Material-UI theme object for dark mode
 */
export const darkTheme: Theme = createTheme({
  // Color palette configuration
  palette: {
    mode: 'dark', // Dark theme mode
    primary: { main: QuantumDark.accentBlue }, // Blue as primary color
    secondary: { main: QuantumDark.accentPink }, // Pink as secondary color
    background: { default: QuantumDark.background, paper: QuantumDark.surface }, // Background colors
    text: { primary: QuantumDark.primaryText, secondary: QuantumDark.secondaryText }, // Text colors
    divider: QuantumDark.border, // Divider and border color
    error: { main: '#F44336' }, // Red error color
    success: { main: QuantumDark.accentGreen }, // Green success color
    warning: { main: QuantumDark.accentOrange }, // Orange warning color
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700 },
  },
  // Component style overrides
  components: {
    // Global CSS baseline styles
    MuiCssBaseline: {
      styleOverrides: {
        // Body background and text color
        body: { backgroundColor: QuantumDark.background, color: QuantumDark.primaryText },
        // Custom scrollbar styling for webkit browsers
        '*::-webkit-scrollbar': { width: 10, height: 10 }, // Scrollbar dimensions
        '*::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 8 }, // Scrollbar thumb style
      },
    },
    // Paper component styling (cards and surfaces)
    MuiPaper: { 
      styleOverrides: { 
        root: { 
          border: `1px solid ${QuantumDark.border}`, // Subtle border
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)', // Subtle shadow
          backgroundColor: QuantumDark.surface // Dark surface background
        } 
      } 
    },
    // Card component styling
    MuiCard: { 
      styleOverrides: { 
        root: { 
          border: `1px solid ${QuantumDark.border}`, // Card border
          backgroundColor: QuantumDark.surface, // Card background
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)' // Very subtle shadow
        } 
      } 
    },
    // AppBar component styling (navigation bar)
    MuiAppBar: { 
      styleOverrides: { 
        root: { 
          backgroundColor: QuantumDark.surface, // AppBar background
          boxShadow: 'none', // No shadow for flat design
          borderBottom: `1px solid ${QuantumDark.border}`, // Bottom border instead
          color: QuantumDark.primaryText // Text color
        } 
      } 
    },
    // Button component styling
    MuiButton: { 
      styleOverrides: { 
        root: { 
          textTransform: 'none', // Keep original text case (no uppercase)
          fontWeight: 700, // Bold text
          borderRadius: '10px', // Rounded corners
          boxShadow: 'none' // No shadow for flat design
        } 
      } 
    },
    // OutlinedInput component styling (form inputs)
    MuiOutlinedInput: { 
      styleOverrides: { 
        notchedOutline: { 
          borderColor: QuantumDark.border // Input border color
        } 
      } 
    },
    // Divider component styling
    MuiDivider: { 
      styleOverrides: { 
        root: { 
          borderColor: QuantumDark.border // Divider color
        } 
      } 
    },
  },
});

/**
 * Neon Theme
 * 
 * Neon dark theme with vibrant colors and glow effects.
 * Features bright neon accents and darker backgrounds for a futuristic look.
 * 
 * @returns {Theme} Material-UI theme object for neon mode
 */
export const neonTheme: Theme = createTheme({
  // Color palette configuration
  palette: {
    mode: 'dark', // Dark theme mode
    primary: { main: NeonLight.accentBlue }, // Bright neon blue as primary
    secondary: { main: NeonLight.accentPink }, // Vibrant neon pink as secondary
    background: { default: NeonLight.background, paper: NeonLight.surface }, // Dark blue backgrounds
    text: { primary: NeonLight.primaryText, secondary: NeonLight.secondaryText }, // Text colors
    divider: NeonLight.border, // Divider color
    error: { main: '#FF3D71' }, // Bright pink error color
    success: { main: NeonLight.accentGreen }, // Cyan green success color
    warning: { main: NeonLight.accentOrange }, // Bright orange warning color
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
        body: { backgroundColor: NeonLight.background, color: NeonLight.primaryText },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 8 },
      },
    },
    // Paper component styling with glow effects
    MuiPaper: { 
      styleOverrides: { 
        root: { 
          border: `1px solid ${NeonLight.border}`, // Subtle border
          boxShadow: '0 0 15px rgba(77, 97, 252, 0.15)', // Blue glow shadow
          backgroundColor: NeonLight.surface // Dark blue surface
        } 
      } 
    },
    // Card component styling with glow effects
    MuiCard: { 
      styleOverrides: { 
        root: { 
          border: `1px solid ${NeonLight.border}`, // Card border
          backgroundColor: NeonLight.surface, // Card background
          boxShadow: '0 0 15px rgba(77, 97, 252, 0.1)' // Blue glow shadow
        } 
      } 
    },
    // AppBar component styling with glow effects
    MuiAppBar: { 
      styleOverrides: { 
        root: { 
          backgroundColor: NeonLight.surface, // AppBar background
          boxShadow: '0 0 15px rgba(77, 97, 252, 0.15)', // Blue glow shadow
          borderBottom: `1px solid ${NeonLight.border}`, // Bottom border
          color: NeonLight.primaryText // Text color
        } 
      } 
    },
    // Button component styling with glow effects
    MuiButton: { 
      styleOverrides: { 
        root: { 
          textTransform: 'none', // Keep original text case
          fontWeight: 700, // Bold text
          borderRadius: '10px', // Rounded corners
          boxShadow: '0 0 10px rgba(77, 97, 252, 0.2)' // Blue glow shadow for buttons
        } 
      } 
    },
    MuiOutlinedInput: { 
      styleOverrides: { 
        notchedOutline: { 
          borderColor: NeonLight.border 
        } 
      } 
    },
    MuiDivider: { 
      styleOverrides: { 
        root: { 
          borderColor: NeonLight.border 
        } 
      } 
    },
  },
});

/**
 * Light Theme
 * 
 * Light theme with clean whites and soft grays.
 * Features high contrast dark text on light backgrounds for readability.
 * 
 * @returns {Theme} Material-UI theme object for light mode
 */
export const lightTheme: Theme = createTheme({
  // Color palette configuration
  palette: {
    mode: 'light', // Light theme mode
    primary: { main: QuantumDark.accentBlue }, // Blue primary color (reused from dark theme)
    secondary: { main: QuantumDark.accentPink }, // Pink secondary color (reused from dark theme)
    background: { default: QuantumLight.background, paper: QuantumLight.surface }, // Light backgrounds
    text: { primary: QuantumLight.primaryText, secondary: QuantumLight.secondaryText }, // Dark text on light background
    divider: QuantumLight.border, // Light gray divider
    error: { main: '#D32F2F' }, // Darker red for light theme
    success: { main: '#1B5E20' }, // Darker green for light theme
    warning: { main: '#B26A00' }, // Darker orange for light theme
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 800, color: QuantumLight.primaryText },
    h4: { fontWeight: 800, color: QuantumLight.primaryText },
    h5: { fontWeight: 700, color: QuantumLight.primaryText },
    h6: { fontWeight: 700, color: QuantumLight.primaryText },
    button: { fontWeight: 700 },
  },
  // Component style overrides
  components: {
    // Global CSS baseline styles
    MuiCssBaseline: {
      styleOverrides: {
        // Body background and text color for light theme
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