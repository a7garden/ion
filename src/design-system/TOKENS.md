# Token System

## Hierarchy

```
Primitive Tokens (raw values)
  └─ color.{hue}.{step}       → oklch(L C H)
  └─ spacing.{scale}           → px values
  └─ radius.{tier}             → px values
  └─ shadow.{tier}             → box-shadow values
  └─ fontFamily.{role}         → font stacks
  └─ fontSize.{role}           → px values
  └─ zIndex.{layer}            → numeric values
      │
Semantic Tokens (purpose-driven aliases)
  └─ surface.{role}           → background surfaces
  └─ text.{role}              → text colors
  └─ interactive.{role}       → interactive controls
  └─ border.{role}            → border colors
  └─ state.{role}             → status colors
      │
Component Tokens (component-specific)
  └─ button.{part}.{state}    → button styling
  └─ input.{part}             → input styling
  └─ card.{part}              → card styling
```

## Rules

1. **Components NEVER consume primitive tokens directly.**
   - ✅ `background: var(--interactive-primary)`
   - ❌ `background: var(--accent-500)`

2. **All color values must use OKLCH format.**
   - ✅ `oklch(0.4566 0.1043 251.2)`
   - ❌ `hsl(210, 60%, 35%)` or `#3366cc`

3. **Interactive element borders use box-shadow, not CSS border.**
   - ✅ `box-shadow: 0 0 0 1px var(--border-default)`
   - ❌ `border: 1px solid var(--border-default)`

## Adding New Tokens

1. Add the raw value to the appropriate primitive token file
2. Create a semantic alias in `tokens/semantic/colors.ts` or `tokens/semantic/typography.ts`
3. Add the CSS custom property to both `themes/light.css` AND `themes/dark.css`
4. If a component uses the new token, add it to `tokens/component/`

## Complete Token Reference

See `DESIGN.md` in the project root for the full token reference with values.
