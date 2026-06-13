// Typography primitive tokens

export const fontFamily = {
  heading: "'Hahmlet', Georgia, serif",
  body: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
} as const;

export const fontSize = {
  caption:  '11px',
  label:    '13px',
  bodySm:   '14px',
  body:     '16px',
  bodyLg:   '18px',
  h4:       '20px',
  h3:       '22px',
  h2:       '28px',
  h1:       '36px',
  display:  '48px',
} as const;

export const fontWeight = {
  regular:    400,
  medium:     500,
  semibold:   600,
  bold:       700,
} as const;

export const lineHeight = {
  tight:    1.10,
  heading:  1.20,
  snug:     1.30,
  normal:   1.40,
  relaxed:  1.50,
  loose:    1.60,
} as const;

export const letterSpacing = {
  tight:    '-0.02em',
  normal:   '0',
} as const;
