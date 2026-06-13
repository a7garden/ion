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
- **텍스트**, **사진(1장)**, **동영상(1개)** 중 선택
  - 사진과 동영상은 혼재 불가 (한 피드당 미디어 1개)
  - 텍스트는 어떤 조합이든 상관없음 (미디어만 있어도, 텍스트만 있어도, 둘 다 있어도 됨)
- 피드 화면에서는 이 세상에 존재하는 **모든 피드 중 k개를 무작위**로 보여줌
  - 팔로잉 개념이 없음
  - 이미 본 피드는 다시 보여주지 않음 (swipe to dismiss)

### Like
- 유일한 상호작용 방식
- **수치로 표시되지 않음** — 좋아요 버튼을 눌렀다는 사실만 존재
- A가 B의 피드에 좋아요를 누르고, B도 A의 피드에 좋아요를 누르면 → **연결 성립**

### World
- 좋아요를 서로 누른 사용자들이 **노드 그래프**로 시각화되는 뷰
- 사용자는 달, 다른 사용자는 별
- 서로 좋아요를 누른 사용자 사이에 **간선(edge)** 이 그려짐
- 수치가 아닌 **연결의 형태**로 관계를 표현

### 없는 것
- ❌ 좋아요 수 표시
- ❌ 댓글 시스템
- ❌ 팔로잉 / 팔로워
- ❌ 알림 뱃지
- ❌ 사용자 프로필 통계

## Tech Stack

| 영역 | 기술 | 비고 |
|------|------|------|
| **호스팅** | Firebase Hosting | 정적 SPA 배포 |
| **인증** | Supabase Auth | Google OAuth |
| **데이터베이스** | Supabase PostgreSQL | RLS로 클라이언트 직접 쿼리 |
| **미디어 저장** | Supabase Storage | `post-media` 버킷 |
| **프론트엔드** | React 19 + TypeScript | Vite 빌드 |
| **스타일** | Tailwind CSS | 다크/라이트 테마 |
| **애니메이션** | Framer Motion | 카드 피직스, 그래프 |

## Database Schema

```
auth.users (Supabase 내장)
    │
    │ 1:1 (트리거 자동 생성)
    ▼
profiles
    id          UUID PK ← auth.users.id
    username    TEXT UNIQUE
    display_name TEXT
    avatar_url  TEXT
    email       TEXT
    created_at  TIMESTAMPTZ
    updated_at  TIMESTAMPTZ

posts
    id          UUID PK
    author_id   UUID FK → profiles.id
    content     TEXT           -- 텍스트 내용 (옵션)
    media_url   TEXT           -- 미디어 URL (옵션)
    media_type  TEXT           -- 'image' | 'video' | NULL
    angle       DOUBLE         -- 월드 뷰 위치 각도
    radius      DOUBLE         -- 월드 뷰 위치 반경
    float_offset DOUBLE        -- 떠다니는 애니메이션 오프셋
    float_delay DOUBLE         -- 애니메이션 딜레이
    created_at  TIMESTAMPTZ

post_likes
    user_id     UUID FK → profiles.id
    post_id     UUID FK → posts.id
    created_at  TIMESTAMPTZ
    PK (user_id, post_id)

post_views
    user_id     UUID FK → profiles.id
    post_id     UUID FK → posts.id
    viewed_at   TIMESTAMPTZ
    PK (user_id, post_id)
```

### RLS 정책

- `profiles`: 읽기 공개, 수정 본인만
- `posts`: 읽기 공개, 생성/삭제 본인만
- `post_likes`: 읽기 공개, 좋아요/취소 본인만
- `post_views`: 본인만 접근
- `storage (post-media)`: 읽기 공개, 업로드 인증 필요, 삭제 본인만

### 핵심 쿼리

```sql
-- 무작위 미확인 피드 k개 (author 정보 + like_count 포함)
SELECT * FROM get_random_unviewed_posts(user_id, k);

-- 상호 좋아요 연결 (World 뷰 간선)
SELECT DISTINCT a.user_id, b.user_id
FROM post_likes a
JOIN post_likes b ON a.post_id = b.post_id
WHERE a.user_id != b.user_id
  AND EXISTS (
    SELECT 1 FROM post_likes c
    JOIN post_likes d ON c.post_id = d.post_id
    WHERE c.user_id = b.user_id AND d.user_id = a.user_id
  );
```

## Project Structure

```
src/
├── lib/
│   └── supabase.ts          # Auth, DB, Storage 통합 클라이언트
├── hooks/
│   ├── useAppState.ts       # 전역 상태 관리 (posts, likes, auth)
│   └── AppProvider.tsx      # React Context 제공
├── components/
│   ├── FeedView.tsx         # 피드 화면 (모바일: 스와이프, 데스크톱: 카드 피직스)
│   ├── FeedCards.tsx        # 데스크톱 카드 레이아웃
│   ├── FeedPhysics.tsx      # 카드 물리 엔진 (d3-force)
│   ├── WorldPage.tsx        # 노드 그래프 뷰 (Canvas)
│   ├── PostCard.tsx         # 개별 피드 카드
│   ├── ExpandedCard.tsx     # 카드 확장 뷰
│   ├── CreatePostModal.tsx  # 피드 작성 모달
│   ├── LoginModal.tsx       # Google 로그인 모달
│   ├── MyPage.tsx           # 내 피드 목록
│   └── Header.tsx           # 네비게이션
├── types/
│   └── index.ts             # Post, AppState 타입
└── constants/
    └── index.ts             # 기본 상태값
```

## Development

```bash
# 의존성 설치
npm install

# 환경변수 설정 (.env)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# 개발 서버
npm run dev

# 빌드
npm run build

# 배포 (Firebase Hosting)
firebase deploy --only hosting
```

## Free Tier Limits

| 서비스 | 무료 한도 |
|--------|----------|
| Supabase DB | 500 MB |
| Supabase Auth | 50,000 MAU |
| Supabase Storage | 1 GB |
| Supabase Bandwidth | 5 GB |
| Firebase Hosting | 360 MB/day |
