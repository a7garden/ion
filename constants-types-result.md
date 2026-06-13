# Constants, Types, and Planet System — Result

All 4 files created/updated successfully with zero TypeScript errors.

## Files Changed
- `src/constants/planets.ts` — **Created.** Defines `PlanetKey`, `PlanetDef`, `PLANETS` record (10 planets with gradients, glows, Korean names), `PLANET_LIST`, and `getPlanet()` helper.
- `src/types/index.ts` — **Updated.** Added `PlanetKey` import, replaced `authorAvatar` with `authorPlanet: PlanetKey` in `Post`, added `Resonance` interface. `Theme` type preserved.
- `src/components/PlanetAvatar.tsx` — **Created.** Reusable planet circle component with gradient background, configurable size, and optional glow effect.
- `src/components/PlanetSelector.tsx` — **Created.** Modal dialog with 5-column grid of all 10 planets, animated selection indicator, uses `Dialog` from `@/components/ui/dialog` and `framer-motion`.

## Notes
- `tsc --noEmit` passes with no errors.
- No existing files besides `src/types/index.ts` were modified.
- The `src/constants/` directory previously existed with `index.ts` only; `planets.ts` was added alongside it.
