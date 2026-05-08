/**
 * Application constants
 * Includes app name, route paths, and design system colors
 */

// App name
export const APP_NAME = 'VibeTracker';

// Route constants (Expo Router paths)
export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  // Main app tabs
  HOME: '/(tabs)/',
  HABITS_ADD: '/(tabs)/habits/add',
  PROFILE: '/(tabs)/profile',
  // Other
  NOT_FOUND: '/+not-found',
} as const;

// Design system colors (from ARCHITECTURE.md)
export const COLORS = {
  // Primary
  primary: '#3B82F6', // Blue 600
  // Success
  success: '#10B981', // Green 600
  // Error
  error: '#EF4444', // Red 600
  // Background
  background: '#FFFFFF', // White
  backgroundGray: '#F9FAFB', // Gray 50
  // Text
  textPrimary: '#111827', // Gray 900
  textSecondary: '#4B5563', // Gray 600
} as const;

// Typography sizes (Tailwind classes)
export const TYPOGRAPHY = {
  headingLarge: 'text-3xl', // 32px
  headingMedium: 'text-2xl', // 24px
  body: 'text-base', // 16px
  small: 'text-sm', // 14px
} as const;

// Spacing (Tailwind scale)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
