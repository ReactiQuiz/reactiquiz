import { createTheme } from '@mui/material/styles';

const appBarHeight = 56; // Define desired AppBar height in pixels (e.g., 56px or 48px)

// Define the dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  // Override mixins to control AppBar/Toolbar height globally
  mixins: {
    toolbar: {
      minHeight: appBarHeight, // Set the minHeight for the toolbar
      // Apply to different breakpoints if you want consistency
      // or specific heights for specific breakpoints
      '@media (min-width:0px) and (orientation: landscape)': {
        minHeight: appBarHeight, // Keep consistent for landscape on small devices
      },
      '@media (min-width:600px)': { // sm breakpoint
        minHeight: appBarHeight, // Keep consistent for larger screens
      },
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#1e1e1e' // Darker AppBar background
        }
      }
    }
    // MuiToolbar will automatically pick up the height from theme.mixins.toolbar
  }
});

export default darkTheme;