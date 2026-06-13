# Supabase Lib & Mappers Update — Complete

All edits applied successfully. TypeScript compiles with zero errors.

## Changes Applied

### `src/lib/supabase.ts`
- `Profile.avatar_url` → `planet: string`
- `FeedRow.author_avatar_url` → `author_planet: string`
- `onAuthStateChange`: callback type and select/query updated from `avatar_url` to `planet` with `'moon'` default
- `getProfile`: select changed from `avatar_url` to `planet`
- Added `updatePlanet()` function after `updateDisplayName()`
- `getUserPosts`: select query changed from `author_avatar_url`/`avatar_url` to `author_planet`/`planet`
- `getUserPosts` map: flattens `author_planet` with `'moon'` fallback
- Appended new sections: Blocks (`blockUser`, `unblockUser`, `getBlockedUserIds`), Reports (`reportPost`), Resonances (`getUnseenResonances`, `markResonanceSeen`, `markAllResonancesSeen`, `checkAndCreateResonance`)

### `src/lib/mappers.ts`
- Rewrote entire file: `authorAvatar` → `authorPlanet` with `'moon'` default via `(row as any).author_planet`

### `src/lib/queryKeys.ts`
- Added `resonances` and `blockedIds` query keys
