// Semantic color tokens — purpose-driven aliases to primitive colors
// Components MUST consume these, never primitive tokens directly.

export const light = {
  // Background surfaces
  surface: {
    default:  'oklch(0.9809 0.0040 107.0)',  // bg
    subtle:   'oklch(0.9713 0.0028 84.6)',  // card
    muted:    'oklch(0.9091 0.0042 67.5)',  // muted
    inverse:  'oklch(0.2151 0.0095 48.2)',  // fg
  },
  // Text & content
  text: {
    primary:    'oklch(0.2151 0.0095 48.2)',  // fg
    secondary:  'oklch(0.5535 0.0180 48.3)',  // muted-fg
    tertiary:   'oklch(0.6459 0.0150 67.0)',  // neutral-400 placeholder
    inverse:    'oklch(0.9713 0.0028 84.6)',  // card/primary-fg
    disabled:   'oklch(0.7259 0.0150 67.0)',  // neutral-200
    brand:      'oklch(0.4566 0.1043 251.2)', // accent-500
  },
  // Interactive elements
  interactive: {
    primary:        'oklch(0.4566 0.1043 251.2)', // accent-500
    primaryHover:   'oklch(0.4166 0.1043 251.2)', // accent-600
    primaryActive:  'oklch(0.3366 0.1043 251.2)', // accent-800
    bg:             'oklch(0.9399 0.0034 67.4)',  // secondary
    text:           'oklch(0.3698 0.0209 48.1)',  // secondary-fg
  },
  // Borders & dividers
  border: {
    subtle:   'oklch(0.9091 0.0042 67.5)',  // muted
    default:  'oklch(0.8865 0.0066 67.6)',  // border
    strong:   'oklch(0.6459 0.0150 67.0)',  // neutral-400
    focus:    'oklch(0.4566 0.1043 251.2)',  // accent-500
  },
  // State colors
  state: {
    success:      'oklch(0.55 0.17 150)',
    successBg:    'oklch(0.55 0.17 150 / 0.15)',
    warning:      'oklch(0.55 0.18 75)',
    warningText:  'oklch(0.65 0.18 75)',
    warningBg:    'oklch(0.55 0.18 75 / 0.15)',
    error:        'oklch(0.5786 0.2137 27.2)',  // red-500
    errorHover:   'oklch(0.5386 0.2137 27.2)',  // red-600
    errorBg:      'oklch(0.5786 0.2137 27.2 / 0.15)',
    info:         'oklch(0.4566 0.1043 251.2)',  // accent-500
    infoBg:       'oklch(0.4566 0.1043 251.2 / 0.15)',
  },
} as const;

export const dark = {
  surface: {
    default:  'oklch(0.1576 0.0051 48.3)',  // bg dark
    subtle:   'oklch(0.2040 0.0069 48.3)',  // card dark
    muted:    'oklch(0.3002 0.0084 48.3)',  // muted dark
    inverse:  'oklch(0.9424 0.0058 84.6)',  // fg dark
  },
  text: {
    primary:    'oklch(0.9424 0.0058 84.6)',  // fg dark
    secondary:  'oklch(0.6462 0.0173 67.5)',  // muted-fg dark
    tertiary:   'oklch(0.5659 0.0150 67.0)',  // neutral-600
    inverse:    'oklch(0.1576 0.0051 48.3)',  // bg dark
    disabled:   'oklch(0.3741 0.0150 67.0)',  // neutral-200 dark
    brand:      'oklch(0.65 0.12 250.9)', // brand accent (lightened for WCAG 4.5:1 against dark surface)
  },
  interactive: {
    primary:        'oklch(0.65 0.12 250.9)', // lightened for WCAG 4.5:1
    primaryHover:   'oklch(0.68 0.11 250.9)',
    primaryActive:  'oklch(0.72 0.10 250.9)',
    bg:             'oklch(0.2585 0.0085 48.3)',  // secondary dark
    text:           'oklch(0.8913 0.0111 84.6)',  // secondary-fg dark
  },
  border: {
    subtle:   'oklch(0.2585 0.0085 48.3)',  // muted high end
    default:  'oklch(0.3205 0.0091 48.3)',  // border dark
    strong:   'oklch(0.5659 0.0150 67.0)',  // neutral-600
    focus:    'oklch(0.5439 0.1184 250.9)', // accent-500 dark
  },
  state: {
    success:      'oklch(0.65 0.17 150)',
    successBg:    'oklch(0.65 0.17 150 / 0.20)',
    warning:      'oklch(0.72 0.18 75)',
    warningText:  'oklch(0.82 0.14 75)',
    warningBg:    'oklch(0.72 0.18 75 / 0.20)',
    error:        'oklch(0.65 0.22 25)',
    errorHover:   'oklch(0.72 0.20 25)',
    errorBg:      'oklch(0.65 0.22 25 / 0.20)',
    info:         'oklch(0.5439 0.1184 250.9)',
    infoBg:       'oklch(0.5439 0.1184 250.9 / 0.20)',
  },
} as const;
