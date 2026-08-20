// src/theme.ts
/**
 * System-Wide Theme Configuration
 *
 * Implements a modern, clean, neutral-gray educational interface for both
 * light and dark modes. Designed with crisp typography, balanced contrast,
 * and elegant, non-over-rounded components.
 */
import { createTheme, Theme } from '@mui/material/styles';
import {
  neutralLight,
  neutralDark,
  fontHeading,
  fontBody,
  radius,
  touchTarget,
} from './themeTokens';

/**
 * buildAppTheme
 *
 * Shared theme builder creating consistent, accessible Light and Dark themes.
 */
function buildAppTheme(mode: 'light' | 'dark'): Theme {
  const t = mode === 'light' ? neutralLight : neutralDark;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: t.accentBase,
        contrastText: mode === 'light' ? '#FFFFFF' : '#0F172A',
      },
      secondary: {
        main: t.accent2Base,
        contrastText: mode === 'light' ? '#FFFFFF' : '#0F172A',
      },
      background: {
        default: t.bg,
        paper: t.surface,
      },
      text: {
        primary: t.text,
        secondary: t.textSecondary,
      },
      divider: t.divider,
      error: {
        main: mode === 'light' ? '#EF4444' : '#F87171',
      },
      success: {
        main: t.accent2Base,
      },
      warning: {
        main: mode === 'light' ? '#F59E0B' : '#FBBF24',
      },
      info: {
        main: t.accentBase,
      },
      action: {
        hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
        selected: mode === 'light' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(96, 165, 250, 0.12)',
      },
    },
    shape: {
      borderRadius: radius.md,
    },
    typography: {
      fontFamily: fontBody,
      h1: { fontFamily: fontHeading, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h2: { fontFamily: fontHeading, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
      h3: { fontFamily: fontHeading, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.3 },
      h4: { fontFamily: fontHeading, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.35 },
      h5: { fontFamily: fontHeading, fontWeight: 600, lineHeight: 1.4 },
      h6: { fontFamily: fontHeading, fontWeight: 600, lineHeight: 1.4 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6, letterSpacing: '-0.01em' },
      body2: { fontSize: '0.875rem', lineHeight: 1.5, letterSpacing: '-0.005em' },
      button: { fontFamily: fontBody, fontWeight: 600, textTransform: 'none' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: t.bg,
            color: t.text,
            transition: 'background-color 0.2s ease, color 0.2s ease',
          },
          '*::-webkit-scrollbar': { width: 8, height: 8 },
          '*::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: mode === 'light' ? '#CBD5E1' : '#334155',
            borderRadius: 4,
          },
          ':focus-visible': { outline: `2px solid ${t.accentBase}`, outlineOffset: '2px' },
          '::selection': { backgroundColor: `${t.accentBase}33` },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: t.surface,
            border: `1px solid ${t.divider}`,
            boxShadow: t.shadowSm,
            borderRadius: radius.md,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: t.surface,
            border: `1px solid ${t.divider}`,
            borderRadius: radius.container,
            boxShadow: t.shadowSm,
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            '&:hover': {
              borderColor: mode === 'light' ? '#CBD5E1' : '#475569',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'none',
            borderBottom: `1px solid ${t.divider}`,
            color: t.text,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: radius.sm,
            minHeight: touchTarget,
            paddingInline: 16,
            boxShadow: 'none',
            transition: 'all 0.15s ease',
            '&:active': { transform: 'scale(0.98)' },
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: t.shadowSm },
          },
          outlined: {
            borderColor: t.divider,
            '&:hover': {
              borderColor: mode === 'light' ? '#94A3B8' : '#64748B',
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.04)',
            },
          },
          sizeSmall: {
            minHeight: 32,
            paddingInline: 12,
            borderRadius: radius.xs,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
            minWidth: 36,
            minHeight: 36,
            transition: 'background-color 0.15s ease, transform 0.15s ease',
            '&:active': { transform: 'scale(0.96)' },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
            minHeight: touchTarget,
            backgroundColor: t.surface,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? '#94A3B8' : '#64748B',
            },
          },
          notchedOutline: {
            borderColor: t.divider,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radius.xs,
            fontWeight: 500,
            fontSize: '0.8125rem',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: t.divider },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: radius.container,
            backgroundColor: t.surface,
            boxShadow: t.shadowLg,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${t.divider}` },
          head: {
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: t.textSecondary,
          },
        },
      },
    },
  });
}

export const lightTheme: Theme = buildAppTheme('light');
export const darkTheme: Theme = buildAppTheme('dark');

// Backwards-compatible aliases
export const organicLightTheme = lightTheme;
export const organicDarkTheme = darkTheme;

