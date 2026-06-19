# Changelog

## [Unreleased]

### Added
- Design system (`src/design-system/`) with primitives, tokens, and themes
- Internationalization framework (`src/i18n/`)
- Test infrastructure: Vitest, jsdom, test setup
- Design documentation (`DESIGN.md`, `docs/designs/`)

### Changed
- Major component refactoring in progress
- Planet identity system
- Square image crop on post creation
- Resonance notifications
- Account deletion flow

---

## [0.0.0] — 2026-06-13

### Added
- Initial Ion SPA with React 19 + TypeScript + Vite
- Supabase Auth (Google OAuth), PostgreSQL, Storage
- Feed with random post display (mobile swipe, desktop card physics)
- Like system (mutual like → graph connection)
- World view: d3-force node graph on Canvas
- Create post with text + media (image or video)
- My page with user's own posts
- Dark/light theme via Tailwind CSS
- Framer Motion card animations
- Cloudflare Pages deployment

### Changed
- Migrated from Firebase Auth + Storage + Neon DB → Supabase (full stack)
- Redesigned DB schema to 3 tables (profiles, posts, likes)
- Redesigned World Node View with Obsidian-style d3-force graph
- Migrated FeedOrbit from Canvas-only to hybrid Canvas+React architecture

### Fixed
- Feed card drag & physics
- Google login account selection
- Dialog z-index layering
- Zoom centered on user node in WorldPage
- Like button action visibility

---

### Legend
- `[Unreleased]` — Changes staged on `develop` branch, not yet released
- `[0.0.0]` — Initial tracked release (accumulated commits up to current HEAD)
