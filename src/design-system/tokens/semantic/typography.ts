// Semantic typography — purpose-driven text styles

import { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } from '../primitive';

export const text = {
  display: {
    fontFamily:   fontFamily.heading,
    fontSize:     fontSize.display,
    fontWeight:   fontWeight.semibold,
    lineHeight:   lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h1: {
    fontFamily:   fontFamily.heading,
    fontSize:     fontSize.h1,
    fontWeight:   fontWeight.semibold,
    lineHeight:   '1.20',
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily:   fontFamily.heading,
    fontSize:     fontSize.h2,
    fontWeight:   fontWeight.semibold,
    lineHeight:   '1.30',
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily:   fontFamily.heading,
    fontSize:     fontSize.h3,
    fontWeight:   fontWeight.semibold,
    lineHeight:   '1.35',
    letterSpacing: 'normal',
  },
  bodyLg: {
    fontFamily:   fontFamily.body,
    fontSize:     fontSize.bodyLg,
    fontWeight:   fontWeight.regular,
    lineHeight:   lineHeight.loose,
    letterSpacing: 'normal',
  },
  body: {
    fontFamily:   fontFamily.body,
    fontSize:     fontSize.body,
    fontWeight:   fontWeight.regular,
    lineHeight:   lineHeight.loose,
    letterSpacing: 'normal',
  },
  bodySm: {
    fontFamily:   fontFamily.body,
    fontSize:     fontSize.bodySm,
    fontWeight:   fontWeight.regular,
    lineHeight:   lineHeight.relaxed,
    letterSpacing: 'normal',
  },
  label: {
    fontFamily:   fontFamily.body,
    fontSize:     fontSize.label,
    fontWeight:   fontWeight.medium,
    lineHeight:   '1.40',
    letterSpacing: 'normal',
  },
  caption: {
    fontFamily:   fontFamily.body,
    fontSize:     fontSize.caption,
    fontWeight:   fontWeight.regular,
    lineHeight:   '1.40',
    letterSpacing: 'normal',
  },
  button: {
    fontFamily:   fontFamily.body,
    fontSize:     '14px',
    fontWeight:   fontWeight.medium,
    lineHeight:   '1.00',
    letterSpacing: 'normal',
  },
} as const;
