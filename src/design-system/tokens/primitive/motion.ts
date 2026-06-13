// Motion primitive tokens

export const duration = {
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
} as const;

export const easing = {
  default:  'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut:  'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn:   'cubic-bezier(0.4, 0, 1, 1)',
  spring:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;
