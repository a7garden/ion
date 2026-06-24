# ion — "i'm alone"

> 수치가 사라진 SNS. 연결만 남는다.

## 철학

기존 SNS는 좋아요 수, 댓글 수, 팔로워 수라는 **수치**로 사람을 가등급한다.
그 수치는 비교를 낳고, 비교는 박탈감을 낳는다.

ion은 이런 수치를 모두 제거했다.
대신, 서로 좋아요를 누른 사람들 사이의 **연결**을 그래프 형태로 보여준다.
숫자가 아니라 **관계의 형태**로 소속감을 느끼게 한다.

## 핵심 개념

### Feed
- 사용자가 올리는 하나의 게시물 단위
- **인스타 스토리 콜라주 모델**:
  - **텍스트만**: 정사각형 카드 안에 본문 15px, line-clamp-6
  - **이미지/영상만**: 미디어가 카드 전체를 채움 (1:1 정사각형)
  - **콜라주**: 미디어 위에 텍스트 오버레이 (white/black/color 선택)
- 피드 화면에서는 전 세계의 **모든 피드 중 k개를 무작위**로 보여줌
  - 팔로잉 개념이 없음
- 카드는 사용자의 이름/프로필/액션 바 없이 **미디어 그 자체**로 떠다님
  - 우하단 하트 1개만 (인스타 스토리와 동일)

### Like
- 유일한 상호작용. **수치로 표시되지 않음**
- A가 B의 피드에 좋아요를 누르고, B도 A의 피드에 좋아요를 누르면 → **연결 성립**

### World
- 상호 좋아요 사용자들이 **노드 그래프**로 시각화되는 뷰
- 사용자 = 달, 다른 사용자 = 별
- 수치가 아닌 **연결의 형태**로 관계를 표현

### 없는 것
- ❌ 좋아요 수, 댓글 수, 팔로워 수
- ❌ 댓글 시스템
- ❌ 공유 버튼 (피드 카드 내부)
- ❌ 팔로잉 / 팔로워
- ❌ 알림 뱃지
- ❌ 사용자 프로필 통계
- ❌ 카드 안 작성자 이름 / 프로필 사진

## Tech Stack

| 영역 | 기술 | 비고 |
|------|------|------|
| **배포** | Cloudflare Pages | 무제한 대역폭, Git 연동 자동 배포 |
| **인증** | Supabase Auth | Google OAuth |
| **데이터베이스** | Supabase PostgreSQL | RLS로 클라이언트 직접 쿼리 |
| **미디어 저장** | Supabase Storage | `media` 버킷 (공개 읽기) |
| **프론트엔드** | React 19 + TypeScript | Vite 빌드 |
| **스타일** | Tailwind CSS | 다크/라이트 테마 |
## Database Schema (3 tables)

```sql
-- 사용자 프로필 (auth.users 생성 시 트리거로 자동 생성)
profiles (
  id          UUID PK ← auth.users.id
  display_name TEXT NOT NULL DEFAULT 'Anonymous'
  avatar_url  TEXT
  email       TEXT
  created_at  TIMESTAMPTZ
)

-- 피드
posts (
  id          UUID PK
  author_id   UUID FK → profiles.id
  content     TEXT NOT NULL DEFAULT ''
  media_url   TEXT            -- NULL = 텍스트 전용
  media_type  TEXT            -- 'image' | 'video' | NULL
  text_overlay TEXT           -- 'white' | 'black' | 'color' | NULL
  text_color  TEXT            -- 'color' 모드일 때 hex
  created_at  TIMESTAMPTZ
  -- 제약: media_url이 있으면 media_type도 필수
)

-- 좋아요 (상호 좋아요 = World 그래프 간선)
likes (
  user_id     UUID FK → profiles.id
  post_id     UUID FK → posts.id
  created_at  TIMESTAMPTZ
  PK (user_id, post_id)
)
```

### RLS

- `profiles`: 읽기 공개, 수정 본인만
- `posts`: 읽기 공개, 생성/삭제 본인만
- `likes`: 읽기 공개, 좋아요/취소 본인만
- `storage (media)`: 읽기 공개, 업로드 인증 필요, 삭제 본인만

### RPC

```sql
-- 무작위 피드 (author 정보 + 오버레이 포함)
feed_random(viewer_id UUID, batch_size INT DEFAULT 10, exclude_ids UUID[] DEFAULT '{}')
  → TABLE(id, author_id, content, media_url, media_type, text_overlay, text_color,
          created_at, author_display_name, author_planet)

-- 상호 좋아요 연결 (World 그래프 간선)
mutual_connections(viewer_id UUID) → TABLE(user_a UUID, user_b UUID)
```

## Project Structure

```
src/
├── lib/
│   └── supabase.ts          # Auth, DB, Storage 통합 클라이언트
├── hooks/
│   ├── useAppState.ts       # 전역 상태 (auth, feed, likes)
│   └── AppProvider.tsx      # React Context
├── components/
│   ├── FeedView.tsx         # 피드 (모바일: 스와이프, 데스크톱: 카드 피직스)
│   ├── FeedCards.tsx        # 데스크톱 카드 레이아웃
│   ├── FeedPhysics.tsx      # d3-force 카드 물리 엔진
│   ├── WorldPage.tsx        # 노드 그래프 (Canvas)
│   ├── PostCard.tsx         # 피드 카드
│   ├── ExpandedCard.tsx     # 카드 확장 뷰
│   ├── CreatePostModal.tsx  # 피드 작성
│   ├── LoginModal.tsx       # Google 로그인
│   ├── MyPage.tsx           # 내 피드
│   └── Header.tsx           # 네비게이션
├── types/index.ts
└── constants/index.ts
```

## Development

```bash
npm install

# .env 설정
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
```

## Deploy

```bash
# Cloudflare Pages (main 브랜치 = 프로덕션)
npm run deploy

# Cloudflare Pages (develop 브랜치 = 프리뷰)
npm run deploy:preview
```

## Free Tier Limits

| 서비스 | 무료 한도 |
|--------|----------|
| Supabase DB | 500 MB |
| Supabase Auth | 50,000 MAU |
| Supabase Storage | 1 GB |
| Supabase Bandwidth | 5 GB |
| Cloudflare Pages | **무제한 대역폭**, 500 builds/월 |
