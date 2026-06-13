// Shadow primitive tokens

export const shadow = {
  sm:    '0 1px 3px oklch(0 0 0 / 0.06)',
  md:    '0 4px 12px oklch(0 0 0 / 0.08)',
  lg:    '0 8px 24px oklch(0 0 0 / 0.12)',
  xl:    '0 16px 40px oklch(0 0 0 / 0.16)',
  glow:  '0 0 20px oklch(0.5903 0.1492 252.0 / 0.15), 0 0 40px oklch(0.5903 0.1492 252.0 / 0.08)',
} as const;

export const shadowDark = {
  sm:    '0 1px 3px oklch(0 0 0 / 0.20)',
  md:    '0 4px 12px oklch(0 0 0 / 0.25)',
  lg:    '0 8px 24px oklch(0 0 0 / 0.30)',
  xl:    '0 16px 40px oklch(0 0 0 / 0.35)',
  glow:  '0 0 20px oklch(0.6273 0.1257 250.5 / 0.2), 0 0 40px oklch(0.6273 0.1257 250.5 / 0.1)',
} as const;
