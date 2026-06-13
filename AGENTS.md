# Project Stack

## Backend
- **Supabase** — Auth (Google OAuth), PostgreSQL (RLS), Storage (post-media 버킷)
- **Firebase Hosting** — 정적 SPA 배포 (`firebase deploy --only hosting`)

## Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS (다크/라이트 테마)
- Framer Motion (카드 피직스, 트랜지션)
- d3-force (월드 뷰 그래프 시뮬레이션)

## Environment Variables
- `VITE_SUPABASE_URL` — Supabase 프로젝트 URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public 키
- `.env`에 설정, gitignore됨

## Architecture
- 백엔드 API 서버 없음
- Supabase JS Client가 직접 DB 쿼리 (RLS로 보안)
- Auth 상태는 `onAuthStateChange`로 감시
- 낙관적 업데이트 (좋아요 토글 시 UI 먼저 반영, 실패 시 롤백)

## Database
- Supabase MCP (`supabase_apply_migration`) 으로 마이그레이션
- RPC 함수 `get_random_unviewed_posts` — 무작위 피드 조회 (author + like_count 조인)
- Storage 버킷 `post-media` — 공개 읽기, 인증 업로드

## Key Conventions
- 게시물 = "피드" 단위, 미디어 1개 (image | video) + 텍스트 (옵션)
- 좋아요, 댓글, 팔로잉 수치 표시 없음
- 상호 좋아요 = World 그래프의 간선
- Supabase 타입: `src/lib/supabase.ts`에 정의, 프론트엔드 타입: `src/types/index.ts`
