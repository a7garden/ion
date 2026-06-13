import { describe, it, expect } from 'vitest';
import { accent, neutral, red, spacing, radius, shadow, shadowDark, zIndex } from '../src/design-system/tokens/primitive';
import { light, dark } from '../src/design-system/tokens/semantic';
import { button, input, card } from '../src/design-system/tokens/component';

describe('Primitive Tokens', () => {
  it('accent palette has 11 steps', () => {
    expect(Object.keys(accent)).toHaveLength(11);
    expect(accent[500]).toBe('oklch(0.4566 0.1043 251.2)');
  });

  it('neutral palette has 11 steps', () => {
    expect(Object.keys(neutral)).toHaveLength(11);
  });

  it('red palette has 11 steps', () => {
    expect(Object.keys(red)).toHaveLength(11);
  });

  it('spacing has 16 values', () => {
    expect(Object.keys(spacing)).toHaveLength(16);
    expect(spacing[4]).toBe('16px');
  });

  it('radius has 4 values (sm, md, lg, full)', () => {
    expect(Object.keys(radius)).toHaveLength(4);
    expect(radius.md).toBe('12px');
  });

  it('shadow has 5 values (sm, md, lg, xl, glow)', () => {
    expect(Object.keys(shadow)).toHaveLength(5);
  });

  it('shadowDark has 5 values', () => {
    expect(Object.keys(shadowDark)).toHaveLength(5);
  });

  it('zIndex has named layers', () => {
    expect(zIndex.modal).toBe(500);
    expect(zIndex.notification).toBe(999);
  });
});

describe('Semantic Tokens', () => {
  it('light theme has all required sections', () => {
    expect(light.surface.default).toBeTruthy();
    expect(light.text.primary).toBeTruthy();
    expect(light.interactive.primary).toBeTruthy();
    expect(light.border.default).toBeTruthy();
    expect(light.state.error).toBeTruthy();
  });

  it('dark theme has all required sections', () => {
    expect(dark.surface.default).toBeTruthy();
    expect(dark.text.primary).toBeTruthy();
    expect(dark.interactive.primary).toBeTruthy();
    expect(dark.border.default).toBeTruthy();
    expect(dark.state.error).toBeTruthy();
  });

  it('all values are valid OKLCH format', () => {
    const oklchRegex = /^oklch\([\d.]+ [\d.]+ [\d.]+/;
    const check = (obj: Record<string, unknown>, path = '') => {
      for (const [key, val] of Object.entries(obj)) {
        if (typeof val === 'string' && val.startsWith('oklch')) {
          expect(val).toMatch(oklchRegex);
        } else if (typeof val === 'object' && val !== null) {
          check(val as Record<string, unknown>, `${path}.${key}`);
        }
      }
    };
    check(light as unknown as Record<string, unknown>, 'light');
    check(dark as unknown as Record<string, unknown>, 'dark');
  });

  it('light and dark themes have identical property names', () => {
    const getPaths = (obj: Record<string, unknown>, prefix = ''): string[] => {
      return Object.entries(obj).flatMap(([key, val]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof val === 'object' && val !== null) {
          return getPaths(val as Record<string, unknown>, path);
        }
        return [path];
      });
    };
    const lightPaths = getPaths(light as unknown as Record<string, unknown>);
    const darkPaths = getPaths(dark as unknown as Record<string, unknown>);
    expect(lightPaths.sort()).toEqual(darkPaths.sort());
  });
});

describe('Component Tokens', () => {
  it('button has variant tokens', () => {
    expect(button.primary.background).toBe('var(--interactive-primary)');
    expect(button.secondary.text).toBe('var(--interactive-text)');
  });

  it('input has shadow tokens', () => {
    expect(input.shadowDefault).toContain('var(--border-default)');
    expect(input.shadowFocus).toContain('var(--border-focus)');
  });

  it('card has radius and shadow', () => {
    expect(card.radius).toBe('var(--radius-lg)');
    expect(card.shadow).toBe('var(--shadow-sm)');
  });
});
