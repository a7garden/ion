/**
 * Ion Design System — Token Constants
 *
 * Typed references to CSS custom properties defined in src/index.css.
 * Use these constants in components to ensure type-safe design token usage.
 *
 * @see DESIGN.md for full specification
 */

export const TOKENS = {
  // Surfaces
  surface: {
    default: 'var(--surface-default)',
    subtle: 'var(--surface-subtle)',
    muted: 'var(--surface-muted)',
    inverse: 'var(--surface-inverse)',
  },
  // Text
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    tertiary: 'var(--text-tertiary)',
    inverse: 'var(--text-inverse)',
    brand: 'var(--text-brand)',
  },
  // Interactive
  interactive: {
    primary: 'var(--interactive-primary)',
    primaryHover: 'var(--interactive-primary-hover)',
    primaryActive: 'var(--interactive-primary-active)',
    bg: 'var(--interactive-bg)',
    text: 'var(--interactive-text)',
  },
  // Borders
  border: {
    subtle: 'var(--border-subtle)',
    default: 'var(--border-default)',
    strong: 'var(--border-strong)',
    focus: 'var(--border-focus)',
  },
  // Status
  state: {
    success: 'var(--state-success)',
    warning: 'var(--state-warning)',
    error: 'var(--state-error)',
    info: 'var(--state-info)',
  },
  // Shadows
  shadow: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    glow: 'var(--shadow-glow)',
  },
  // Z-Index
  z: {
    base: 'var(--z-base)',
    dropdown: 'var(--z-dropdown)',
    overlay: 'var(--z-overlay)',
    sticky: 'var(--z-sticky)',
    modal: 'var(--z-modal)',
    notification: 'var(--z-notification)',
  },
  // Radius
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    full: '9999px',
  },
  // Typography
  typography: {
    display: {
      fontFamily: 'Hahmlet, Georgia, serif',
      fontSize: '48px',
      lineHeight: '1.10',
      letterSpacing: '-0.02em',
      fontWeight: '600',
    },
    h1: {
      fontFamily: 'Hahmlet, Georgia, serif',
      fontSize: '36px',
      lineHeight: '1.20',
      letterSpacing: '-0.02em',
      fontWeight: '600',
    },
    h2: {
      fontFamily: 'Hahmlet, Georgia, serif',
      fontSize: '28px',
      lineHeight: '1.30',
      letterSpacing: '-0.02em',
      fontWeight: '600',
    },
    h3: {
      fontFamily: 'Hahmlet, Georgia, serif',
      fontSize: '22px',
      lineHeight: '1.35',
      fontWeight: '600',
    },
    bodyLg: {
      fontFamily: 'Pretendard, sans-serif',
      fontSize: '18px',
      lineHeight: '1.60',
      fontWeight: '400',
    },
    body: {
      fontFamily: 'Pretendard, sans-serif',
      fontSize: '16px',
      lineHeight: '1.60',
      fontWeight: '400',
    },
    bodySm: {
      fontFamily: 'Pretendard, sans-serif',
      fontSize: '14px',
      lineHeight: '1.50',
      fontWeight: '400',
    },
    label: {
      fontFamily: 'Pretendard, sans-serif',
      fontSize: '13px',
      lineHeight: '1.40',
      fontWeight: '500',
    },
    caption: {
      fontFamily: 'Pretendard, sans-serif',
      fontSize: '11px',
      lineHeight: '1.40',
      fontWeight: '400',
    },
    button: {
      fontFamily: 'Pretendard, sans-serif',
      fontSize: '14px',
      lineHeight: '1.00',
      fontWeight: '500',
    },
  },
} as const;
