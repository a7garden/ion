/**
 * Ion Design System — Token Constants
 */

export const TOKENS = {
  surface: {
    default: 'var(--surface-default)',
    subtle: 'var(--surface-subtle)',
    muted: 'var(--surface-muted)',
    elevated: 'var(--surface-elevated)',
    inverse: 'var(--surface-inverse)',
  },
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    tertiary: 'var(--text-tertiary)',
    inverse: 'var(--text-inverse)',
    brand: 'var(--text-brand)',
  },
  interactive: {
    primary: 'var(--interactive-primary)',
    primaryHover: 'var(--interactive-primary-hover)',
    primaryActive: 'var(--interactive-primary-active)',
    bg: 'var(--interactive-bg)',
    text: 'var(--interactive-text)',
  },
  border: {
    subtle: 'var(--border-subtle)',
    default: 'var(--border-default)',
    strong: 'var(--border-strong)',
    focus: 'var(--border-focus)',
  },
  state: {
    success: 'var(--state-success)',
    warning: 'var(--state-warning)',
    error: 'var(--state-error)',
    info: 'var(--state-info)',
  },
  shadow: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    glow: 'var(--shadow-glow)',
  },
  z: {
    base: 'var(--z-base)',
    dropdown: 'var(--z-dropdown)',
    overlay: 'var(--z-overlay)',
    sticky: 'var(--z-sticky)',
    modal: 'var(--z-modal)',
    notification: 'var(--z-notification)',
  },
  gradient: {
    thread: 'var(--thread-gradient)',
    threadPurple: 'oklch(var(--thread-purple))',
    threadPink: 'oklch(var(--thread-pink))',
    threadAccent: 'oklch(var(--thread-accent))',
  },
} as const;
