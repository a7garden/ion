# Theming

Theme switching uses a custom `ThemeProvider` with `data-theme` attribute on `<html>`.

## How It Works

1. **Initial load**: Inline script reads `localStorage` → OS preference → falls back to `'light'`
2. **Sets** `data-theme="light"` or `data-theme="dark"` on `<html>`
3. **CSS**: All tokens defined under `[data-theme="light"]` and `[data-theme="dark"]` selectors

## Files

- `themes/light.css` — All semantic tokens for light mode
- `themes/dark.css` — All semantic tokens for dark mode (lightness inverted)

## Adding a Theme

1. Create a new CSS file (e.g., `themes/high-contrast.css`)
2. Define ALL semantic tokens under the `[data-theme="high-contrast"]` selector
3. No component changes needed — components reference `var(--token-name)` exclusively

## Dark Mode Principles

- Lightness channel is inverted (light bg → dark bg, dark text → light text)
- Hue (H) is preserved unchanged
- Chroma (C) is carried over from light-mode palette
- All semantic tokens defined in both themes (identical set of CSS custom properties)

## Tailwind Integration

For Tailwind `dark:` utilities to work with the design system:

```js
// tailwind.config.js
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
}
```
