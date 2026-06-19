# Hooks Update Results

All 6 tasks completed successfully. TypeScript compiles cleanly (`tsc --noEmit` — no errors).

## Changes Applied

### 1. `src/hooks/AuthProvider.tsx`
- `AuthUser.avatarUrl: string | null` → `AuthUser.planet: string`
- `onAuthStateChange` callback now maps `authUser.planet` instead of `authUser.avatar_url`

### 2. `src/hooks/queries/useProfile.ts`
- `ProfileData.avatarUrl: string | null` → `ProfileData.planet: string`
- `useProfileQuery` queryFn now maps `data.planet` instead of `data.avatar_url`

### 3. `src/hooks/queries/useLikes.ts`
- Added `checkAndCreateResonance` import from `@/lib/supabase`
- `useToggleLike` mutation now calls `checkAndCreateResonance(userId, postId)` after liking
- On resonance creation, invalidates `queryKeys.resonances(userId)`
- Resonance failure is caught silently (does not block the like)

### 4. `src/hooks/queries/useMyPosts.ts`
- Removed `authorAvatar` parameter from `useCreatePost`
- Removed `author_avatar_url` from the object passed to `toPost()`
- Used `as any` cast to accommodate the missing field

### 5. `src/hooks/queries/useResonances.ts` (new)
- `useUnseenResonancesQuery` — polls every 30s for unseen resonances
- `useMarkResonanceSeen` — marks a single resonance as seen
- `useMarkAllResonancesSeen` — marks all resonances as seen

### 6. `src/hooks/queries/useBlocks.ts` (new)
- `useBlockedIdsQuery` — fetches blocked user IDs
- `useToggleBlock` — block/unblock toggle with cache invalidation
