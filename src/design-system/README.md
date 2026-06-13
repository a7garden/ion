# Ion Design System

A warm, understated design system for the Ion social app — OKLCH-native tokens with light/dark themes.

## Installation

```bash
npm install
```

## Quick Start

```tsx
import { ThemeProvider, Button, Card } from './src/design-system';

function App() {
  return (
    <ThemeProvider>
      <Card>
        <CardContent>
          <Button variant="primary">Get Started</Button>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}
```

## Usage

Wrap your app root with `ThemeProvider` to enable light/dark theme switching:

```tsx
import { ThemeProvider } from './src/design-system';

// In your root component:
<ThemeProvider>
  <App />
</ThemeProvider>
```

Toggle themes:

```tsx
import { useTheme } from './src/design-system';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>;
}
```

## Import Design System CSS

In your `index.css` or main entry:

```css
@import './src/design-system/themes/light.css';
@import './src/design-system/themes/dark.css';
```

## Available Components

| Component | Status | Description |
|-----------|--------|-------------|
| Button | ✅ | 5 variants × 4 sizes, loading state |
| Input | ✅ | 4 sizes, error state, box-shadow borders |
| Card | ✅ | Header, Title, Description, Content, Footer |
| Dialog | ✅ | Radix-based compound component with Overlay, Content, Title |

## Commands

```bash
npm test          # Run tests
npm run typecheck # TypeScript type checking
npm run build     # Build for production
```
