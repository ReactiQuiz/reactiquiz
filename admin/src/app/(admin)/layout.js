// admin/src/app/layout.js
'use client'; // This is required for MUI ThemeProvider
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './globals.css'; // Keep the default global styles

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0A0A0A', // A slightly off-black for a professional look
      paper: '#1A1A1A',
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}