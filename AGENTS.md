# Ion — "i'm alone"

수치 없는 SNS. 상호 좋아요 = 그래프 연결.

## Stack
- **Supabase** — Auth (Google OAuth), PostgreSQL (RLS), Storage (`media` 버킷)
- **Cloudflare Pages** — 정적 SPA 배포 (`npm run deploy`)

## Database
3 tables: `profiles`, `posts`, `likes`
- Supabase MCP로 마이그레이션 (`supabase_apply_migration`)
- RPC: `feed_random()`, `mutual_connections()`

## Architecture
- 백엔드 API 서버 없음
- Supabase JS Client → 직접 DB 쿼리 (RLS 보안)
- `onAuthStateChange`로 auth 감시
- 좋아요: 낙관적 업데이트 → 실패 시 롤백

## Environment
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (`.env`, gitignore)
- Cloudflare Pages에서 환경변수 설정 필요

## Key Rules
- 피드 = 텍스트 + 미디어 1개 (image | video)
- 좋아요 수, 댓글 수, 팔로워 수 표시 금지
- 상호 좋아요 → World 그래프 간선
- Types: `src/types/index.ts`, Supabase: `src/lib/supabase.ts`

## Commands
- `npm run dev` — 개발
- `npm run build` — 빌드
- `npm run deploy` — Cloudflare Pages 프로덕션 배포
- `npm run deploy:preview` — Cloudflare Pages 프리뷰 배포
