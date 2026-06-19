# Critical Bugs Fix — hooks + modal

All 4 edits applied successfully. TypeScript build passes (`tsc -b --noEmit` — no errors).

## Completed

### 1. `src/hooks/AuthProvider.tsx` — overwritten
- Added `setPlanet: (planet: string) => void` and `setDisplayName: (name: string) => void` to `AuthContextValue`.
- Implemented both as `useCallback`s that use the functional `setUser` form to safely patch the existing `AuthUser` (returns previous unchanged if user is null).
- Wired both into the `AuthContext.Provider value={...}`.

### 2. `src/hooks/queries/useResonances.ts` — overwritten
- Hoisted `key = queryKeys.resonances(userId)` once at the top of each hook for clarity / DRY.
- `useMarkResonanceSeen`: added `onMutate` that optimistically filters the clicked resonance out of the cached array, `onError` that rolls back to the snapshot, and kept `onSettled` invalidation.
- `useMarkAllResonancesSeen`: same pattern — optimistic clear (`setQueryData(key, [])`) with snapshot rollback on error and final invalidation on settle.

### 3. `src/components/ImageCropModal.tsx` — `handleCrop` replaced
- Output canvas is now a fixed `OUTPUT_SIZE = 800` (was `Math.min(width, height)` of the source, which distorted aspect ratio).
- Source rect is now clamped: if `sx`/`sy` is negative (user dragged image too far), the draw destination is shifted accordingly and `sx`/`sy` are zeroed so the source rect stays inside the image bounds.
- `maxSource = Math.min(sSize, imageEl.width - sx, imageEl.height - sy)` guarantees we never sample past image edges, with an early return if nothing is visible.
- `drawSourceSize` and `drawDestSize` preserve the requested aspect ratio in the output.
- Background is filled with `hsl(var(--background))` so off-image areas are not transparent/black.

### 4. `src/hooks/useImageCropper.tsx` — **created (extension: `.tsx`)**
- Encapsulates crop modal state (`cropFile`, `cropOpen`) and a `resolverRef` that holds the pending `Promise` resolver.
- `requestCrop(file)` returns `Promise<Blob>`, sets the file, and opens the modal.
- `handleComplete` resolves the promise with the blob and clears state.
- `handleOpenChange(false)` rejects with `new Error('cancelled')` so callers can distinguish cancel from success.
- Returns `{ requestCrop, CropModal }` where `CropModal` is a ready-to-render `<ImageCropModal>` element.

## Files Changed

- `src/hooks/AuthProvider.tsx` — added `setPlanet` / `setDisplayName` to context.
- `src/hooks/queries/useResonances.ts` — added optimistic updates + rollback to both `useMarkResonanceSeen` and `useMarkAllResonancesSeen`.
- `src/components/ImageCropModal.tsx` — fixed `handleCrop` coordinate math (fixed output size + clamped source rect + bg fill).
- `src/hooks/useImageCropper.tsx` — **new file** exposing `requestCrop()` promise API + pre-bound `CropModal` element.

## Notes

- **Extension deviation:** The task specified `useImageCropper.ts` but the provided content contains JSX (`<ImageCropModal ... />`). TypeScript (`jsx: "react-jsx"`) refuses JSX in `.ts` files, so I created it as **`useImageCropper.tsx`** instead. With `.ts` the project failed `tsc -b` with TS1005/TS1109 at line 42; renaming to `.tsx` makes the build pass cleanly. All import paths use the `@/` alias so callers don't care about the extension.
- `useImageCropper` is intentionally not exported with a default — consumers do `const { requestCrop, CropModal } = useImageCropper()` and render `{CropModal}` somewhere in their tree.
- The crop function uses `hsl(var(--background))` to match the app's background CSS variable — make sure that variable is defined in the consuming theme; if not, the fallback will be the inherited canvas bg, which is fine.
- No lint scripts were run (the project's lint is `eslint .` but the task didn't require it); only `tsc -b --noEmit` was used to validate the changes.
