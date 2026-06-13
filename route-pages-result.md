All changes applied successfully. Build passes cleanly.

## Changes Made

1. **`components/MyPage.tsx`** — Full rewrite:
   - Replaced avatar image display with `PlanetAvatar` component
   - Added `PlanetSelector` modal for changing planet
   - Added `onChangePlanet` prop
   - Changed `userAvatar` prop to `userPlanet` (PlanetKey)
   - Changed media display from `object-cover` to `object-contain`

2. **`components/CreatePostModal.tsx`** — Added image crop integration:
   - Added `ImageCropModal` import
   - Added `cropFile` and `cropOpen` state
   - `handleMediaSelect`: images go through crop flow, videos use direct preview
   - Drop handler: same logic — images → crop, videos → direct
   - Added `handleCropComplete` handler
   - Reset crop state in useEffect cleanup
   - Added `ImageCropModal` to JSX before closing `</Dialog>`

3. **`routes/MyPageRoute.tsx`** — Full rewrite:
   - Removed `authorAvatar` reference
   - Added `authorPlanet` from `user?.planet`
   - Uses `useUpdatePlanet` hook
   - Passes `userPlanet` and `onChangePlanet` to MyPageComponent

4. **`hooks/queries/useProfile.ts`** — Added `useUpdatePlanet`:
   - Added `updatePlanet` import
   - New mutation hook with optimistic update for planet field

5. **`routes/FeedRoute.tsx`** — Removed `authorAvatar`:
   - Deleted `authorAvatar` variable
   - Changed `useCreatePost(userId, authorName, authorAvatar)` → `useCreatePost(userId, authorName)`

6. **`components/WorldPage.tsx`** — Planet-colored current user node:
   - Added `currentUserPlanet` prop
   - Replaced `drawMoon` with `drawPlanet` + `PLANET_COLORS` map for all 10 planets
   - Current user node uses their planet colors instead of hardcoded moon

7. **`routes/WorldRoute.tsx`** — Pass planet to WorldPage:
   - Added `currentUserPlanet` from user object
   - Passes `currentUserPlanet` prop to WorldPageComponent

8. **`components/ExpandedCard.tsx`** — Fixed unused import:
   - Removed unused `getPlanet` import (pre-existing issue, caused build error)
