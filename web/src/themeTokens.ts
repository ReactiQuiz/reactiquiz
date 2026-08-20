// src/themeTokens.ts
/**
 * Modern Clean Neutral Design Tokens for Educational Focus
 *
 * Designed according to educational UI/UX best practices:
 * - Neutral soft grays (slate/neutral ramps) to reduce cognitive fatigue
 * - Purposeful, high-contrast, calm primary accent (clean modern slate-blue/indigo)
 * - Balanced light and dark surfaces with even, pleasing contrast
 * - Modern clean border radii (less rounded, 6-12px instead of oversized bubbles)
 * - Clear visual hierarchy and high readability
 */

// ---- Neutral Grayscale Ramps (Slate/Zinc tone for clean modern feel) ----

export const neutralRamp = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  950: '#020617',
} as const;

// ---- Balanced Primary & Secondary Accents (Clean, non-distracting educational tones) ----

export const primaryAccentRamp = {
  50: '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#4F46E5', // Crisp indigo/slate blue
  600: '#4338CA',
  700: '#3730A3',
  800: '#312E81',
  900: '#1E1B4B',
} as const;

export const secondaryAccentRamp = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#10B981', // Calm emerald for success/learning milestones
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
} as const;

// ---- Light Mode (Even clean gray & crisp white surfaces) ----------------

export const neutralLight = {
  bg: '#F8FAFC',           // Soft, glare-free off-white light slate
  surface: '#FFFFFF',      // Crisp card/paper surface
  surface2: '#F1F5F9',     // Slightly elevated secondary surface
  text: '#0F172A',         // High-contrast deep slate for maximum readability
  textSecondary: '#64748B',// Accessible muted secondary text (4.5:1+ contrast)
  divider: '#E2E8F0',      // Subtle clean border line
  accentBase: '#3B82F6',   // Clean focus blue
  accentHover: '#2563EB',
  accentPressed: '#1D4ED8',
  accentBodyText: '#1D4ED8',
  accent2Base: '#10B981',
  accent2Hover: '#059669',
  accent2Pressed: '#047857',
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
} as const;

// ---- Dark Mode (Even charcoal/slate surfaces, no jarring harsh contrast) ----

export const neutralDark = {
  bg: '#0F172A',           // Deep slate background (avoids pure OLED black eye strain)
  surface: '#1E293B',      // Elevated surface slate-800
  surface2: '#334155',     // Secondary surface slate-700
  text: '#F8FAFC',         // Crisp soft white
  textSecondary: '#94A3B8',// Readable slate-400
  divider: 'rgba(255, 255, 255, 0.10)',
  accentBase: '#60A5FA',   // Lighter balanced blue for dark backgrounds
  accentHover: '#93C5FD',
  accentPressed: '#BFDBFE',
  accentBodyText: '#93C5FD',
  accent2Base: '#34D399',
  accent2Hover: '#6EE7B7',
  accent2Pressed: '#A7F3D0',
  shadowSm: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
  shadowMd: '0 4px 8px -1px rgba(0, 0, 0, 0.4)',
  shadowLg: '0 10px 20px -3px rgba(0, 0, 0, 0.5)',
} as const;

// Backwards-compatible aliases
export const organicLight = neutralLight;
export const organicDark = neutralDark;
export const accentRamp = primaryAccentRamp;
export const accent2Ramp = secondaryAccentRamp;

// ---- Typography (Modern, crisp, legible educational font stack) ---------

export const fontHeading = '"Figtree", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
export const fontBody = '"Figtree", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// ---- Spacing & Touch targets --------------------------------------------

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
} as const;

export const touchTarget = 40; // px

// ---- Clean Modern Radius (Less rounded, crisp rectangular elegance) -----

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  container: 12, // Less rounded clean container cards
  pill: 8,       // Modern rounded-md buttons instead of heavy pills
} as const;

// ---- Motion -------------------------------------------------------------

export const motion = {
  smooth: { type: 'spring' as const, duration: 0.3, bounce: 0 },
  snappy: { type: 'spring' as const, duration: 0.25, bounce: 0.05 },
  pressScale: 0.98,
} as const;

