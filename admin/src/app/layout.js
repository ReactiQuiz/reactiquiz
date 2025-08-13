// admin/src/app/layout.js
'use client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { adminTheme } from '../theme'; // <-- Import the new theme
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={adminTheme}> {/* <-- Use the new theme */}
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}