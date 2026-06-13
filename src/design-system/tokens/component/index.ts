// Component-specific tokens — reference semantic tokens

export const button = {
  primary: {
    background:     'var(--interactive-primary)',
    backgroundHover: 'var(--interactive-primary-hover)',
    backgroundActive: 'var(--interactive-primary-active)',
    text:           'var(--text-inverse)',
    radius:         'var(--radius-md)',
  },
  secondary: {
    background:       'var(--interactive-bg)',
    backgroundHover:  'var(--surface-muted)',
    text:             'var(--interactive-text)',
    radius:           'var(--radius-md)',
  },
  ghost: {
    background:       'transparent',
    backgroundHover:  'var(--surface-muted)',
    text:             'var(--text-primary)',
    radius:           'var(--radius-md)',
  },
  outline: {
    background:       'transparent',
    text:             'var(--text-primary)',
    border:           'var(--border-default)',
    radius:           'var(--radius-md)',
  },
  destructive: {
    background:       'var(--state-error)',
    backgroundHover:  'var(--state-error-hover)',
    text:             'oklch(0.98 0 0)',
    radius:           'var(--radius-md)',
  },
} as const;

export const input = {
  background:     'var(--surface-default)',
  radius:         'var(--radius-md)',
  shadowDefault:  '0 0 0 1px var(--border-default), var(--shadow-sm)',
  shadowFocus:    '0 0 0 1px var(--border-focus), var(--shadow-sm)',
  shadowError:    '0 0 0 1px var(--state-error), var(--shadow-sm)',
  placeholder:    'var(--text-tertiary)',
} as const;

export const card = {
  radius:         'var(--radius-lg)',
  shadow:         'var(--shadow-sm)',
  padding:        '16px',
} as const;

export const dialog = {
  radius:         'var(--radius-lg)',
  shadow:         'var(--shadow-xl)',
  backdropColor:  'oklch(0 0 0 / 0.4)',
} as const;

export const badge = {
  radius:         'var(--radius-full)',
} as const;

export const popover = {
  radius:         'var(--radius-lg)',
  background:     'var(--surface-default)',
  border:         '1px solid var(--border-subtle)',
  shadow:         'var(--shadow-md)',
} as const;
