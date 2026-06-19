# Ion 상태 관리 전면 리팩토링 설계

**날짜**: 2026-06-13
**범위**: 라우팅, 상태 분리, 로딩/에러 UI, revalidation

---

## 1. 현재 문제 요약

| 문제 | 원인 | 영향 |
|---|---|---|
| 브라우저 뒤로가기 불가 | `useState<View>`로 뷰 전환 | UX 저하 |
| feed/my 데이터 충돌 | 단일 `posts` 배열 공유 | 뷰 전환 시 깜빡임 |
| 로딩/에러 상태 없음 | AppState에 미포함 | 빈 화면 오해 |
| toggleLike stale closure | `useCallback` 캡처 의존성 | 빠른 클릭 시 race condition |
| WorldPage feed 데이터 의존 | 독립 쿼리 없음 | 불완전한 그래프 |
| 재갱신 메커니즘 없음 | 수동 새로고침만 | 오래된 데이터 |

---

## 2. 아키텍처 개요

```
┌─────────────────────────────────────────────┐
│                   App.tsx                    │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │ QueryClient  │  │    BrowserRouter     │ │
│  │  Provider    │  │                      │ │
│  └──────────────┘  └──────────────────────┘ │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │ AuthProvider │  │   ClientProvider     │ │
│  │  (Context)   │  │    (Context)         │ │
│  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────┘

상태 분류:
  서버 상태 → TanStack Query (posts, likes, profile, world)
  클라이언트 상태 → Context (theme, zoom, auth session)
  물리 엔진 상태 → positionStore (변경 없음)
```

---

## 3. 파일 구조

```
src/
  main.tsx
  App.tsx                       ← QueryClientProvider + BrowserRouter + AuthProvider + ClientProvider

  routes/
    Layout.tsx                  ← Header + Outlet + Toaster
    FeedRoute.tsx               ← / (FeedView 래핑)
    WorldRoute.tsx              ← /world
    MyPageRoute.tsx             ← /my (보호됨)
    RequireAuth.tsx             ← 인증 가드

  hooks/
    AuthProvider.tsx            ← auth context (user, isLoading, login, logout)
    ClientProvider.tsx          ← 클라이언트 상태 (theme, zoomLevel)
    queries/
      useFeed.ts                ← useFeedQuery, useDismissPost
      useMyPosts.ts             ← useMyPostsQuery, useCreatePost, useDeletePost
      useLikes.ts               ← useLikedIdsQuery, useToggleLike
      useWorld.ts               ← useWorldGraphQuery
      useProfile.ts             ← useProfileQuery, useUpdateProfile
    useDeviceSize.ts            ← 변경 없음

  lib/
    supabase.ts                 ← 순수 데이터 접근 함수 (상태 제거)
    queryClient.ts              ← QueryClient 설정
    queryKeys.ts                ← 쿼리 키 팩토리
    mappers.ts                  ← FeedRow → Post 변환

  stores/
    positionStore.ts            ← 변경 없음

  components/
    Header.tsx                  ← NavLink 사용
    FeedView.tsx                ← useFeedQuery 사용
    WorldPage.tsx               ← useWorldGraphQuery 사용
    MyPage.tsx                  ← useMyPostsQuery 사용
    ...나머지 컴포넌트는 변경 최소화

  types/
    index.ts                    ← Post, Theme 유지. AppState 제거
  constants/
    index.ts                    ← STORAGE_KEY 유지. DEFAULT_STATE 제거
```

---

## 4. 라우팅 설계

### 4.1 라우트 정의

| 경로 | 컴포넌트 | 인증 |
|---|---|---|
| `/` | FeedRoute | 불필요 |
| `/world` | WorldRoute | 불필요 (비로그인 시 빈 그래프) |
| `/my` | MyPageRoute | **필요** (미인증 → `/` 리다이렉트 + 로그인 모달) |

### 4.2 RequireAuth

```tsx
// 비로그인 접근 시
function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" state={{ showLogin: true }} replace />;
  return children;
}
```

FeedRoute에서 `useLocation().state?.showLogin`을 감지하여 로그인 모달 자동 오픈.

### 4.3 Header

```tsx
// NavLink로 활성 탭 표시
<NavLink to="/">Feed</NavLink>
<NavLink to="/world">World</NavLink>
<NavLink to="/my">{user ? 'My' : 'Login'}</NavLink>
```

`useNavigate()` 대신 `<NavLink>` 사용 → 브라우저 히스토리 자동 관리.

---

## 5. 상태 관리 상세

### 5.1 AuthProvider (Context)

```ts
interface AuthContextValue {
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  isLoading: boolean;       // 초기 세션 로드 중
  login: () => Promise<void>;
  logout: () => Promise<void>;
}
```

- `onAuthStateChange`로 세션 감시
- 로그아웃 시 `queryClient.clear()` 호출 → 모든 캐시 초기화
- TanStack Query 훅에서 `enabled: !!user?.id`로 인증 연동

### 5.2 ClientProvider (Context)

```ts
interface ClientContextValue {
  theme: 'white' | 'black';
  zoomLevel: number;
  toggleTheme: () => void;
  setZoomLevel: (level: number) => void;
}
```

- localStorage에 theme, zoomLevel 저장 (기존 로직 유지)
- 앱의 유일한 클라이언트 상태

### 5.3 쿼리 키 팩토리

```ts
export const queryKeys = {
  feed:              (userId: string) => ['feed', userId] as const,
  myPosts:           (userId: string) => ['myPosts', userId] as const,
  likedIds:          (userId: string) => ['likedIds', userId] as const,
  profile:           (userId: string) => ['profile', userId] as const,
  mutualConnections: (userId: string) => ['mutualConnections', userId] as const,
  worldGraph:        (userId: string) => ['worldGraph', userId] as const,
} as const;
```

### 5.4 QueryClient 설정

```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,           // 30초간 캐시를 fresh로 간주
      gcTime: 5 * 60_000,          // 5분 후 가비지 컬렉션
      refetchOnWindowFocus: true,   // 앱 복귀 시 자동 재갱신
      retry: 1,
    },
  },
});
```

### 5.5 쿼리 훅 설계

#### useFeed

```ts
export function useFeedQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.feed(userId),
    queryFn: async () => {
      const rows = await getFeed(userId, 10);
      return rows.map(toPost);
    },
    enabled: !!userId,
  });
}

export function useDismissPost(userId: string) {
  const queryClient = useQueryClient();
  return useCallback((postId: string) => {
    queryClient.setQueryData<Post[]>(queryKeys.feed(userId), (old = []) =>
      old.filter(p => p.id !== postId)
    );
  }, [queryClient, userId]);
}
```

#### useMyPosts

```ts
export function useMyPostsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.myPosts(userId),
    queryFn: async () => {
      const rows = await getUserPosts(userId);
      return rows.map(toPost);
    },
    enabled: !!userId,
  });
}

export function useCreatePost(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (opts: { content: string; mediaFile?: File }) => {
      // upload media → create post → return Post
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myPosts(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed(userId) });
    },
  });
}

export function useDeletePost(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deletePostDb(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.myPosts(userId) });
      const prev = queryClient.getQueryData<Post[]>(queryKeys.myPosts(userId));
      queryClient.setQueryData(queryKeys.myPosts(userId), (old: Post[] = []) =>
        old.filter(p => p.id !== postId)
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(queryKeys.myPosts(userId), context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myPosts(userId) });
    },
  });
}
```

#### useLikes

```ts
export function useLikedIdsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.likedIds(userId),
    queryFn: () => getMyLikedPostIds(userId),
    enabled: !!userId,
  });
}

export function useToggleLike(userId: string) {
  const queryClient = useQueryClient();
  const likedQueryKey = queryKeys.likedIds(userId);

  return useMutation({
    mutationFn: async ({ postId, wasLiked }: { postId: string; wasLiked: boolean }) => {
      if (wasLiked) await unlikePost(userId, postId);
      else await likePost(userId, postId);
    },
    onMutate: async ({ postId, wasLiked }) => {
      await queryClient.cancelQueries({ queryKey: likedQueryKey });
      const prev = queryClient.getQueryData<string[]>(likedQueryKey);
      queryClient.setQueryData<string[]>(likedQueryKey, (old = []) =>
        wasLiked ? old.filter(id => id !== postId) : [...old, postId]
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(likedQueryKey, context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: likedQueryKey });
    },
  });
}
```

**stale closure 문제 해결**: `onMutate`가 `queryClient.getQueryData()`로 최신 상태를 읽기 때문에 캡처 문제 없음. 빠른 연속 클릭도 안전.

#### useWorld

```ts
export function useWorldGraphQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.worldGraph(userId),
    queryFn: async () => {
      const [connections, rows] = await Promise.all([
        getMutualConnections(userId),
        getFeed(userId, 50),      // 더 많은 데이터로 그래프 구성
      ]);
      return {
        connections,
        posts: rows.map(toPost),
      };
    },
    enabled: !!userId,
    staleTime: 60_000,  // 그래프는 1분 캐시
  });
}
```

#### useProfile

```ts
export function useProfileQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => getProfile(userId),
    enabled: !!userId,
  });
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (displayName: string) => updateDisplayName(userId, displayName),
    onMutate: async (displayName) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profile(userId) });
      const prev = queryClient.getQueryData(queryKeys.profile(userId));
      queryClient.setQueryData(queryKeys.profile(userId), (old: any) =>
        old ? { ...old, display_name: displayName } : old
      );
      return { prev };
    },
    onError: (_err, _name, context) => {
      if (context?.prev) queryClient.setQueryData(queryKeys.profile(userId), context.prev);
    },
  });
}
```

---

## 6. 로딩/에러 UI

### 6.1 각 뷰의 렌더링 패턴

```tsx
// FeedRoute.tsx
function FeedRoute() {
  const { user } = useAuth();
  const { data: posts, isLoading, isError, error, refetch } = useFeedQuery(user?.id ?? '');
  const { data: likedIds } = useLikedIdsQuery(user?.id ?? '');

  if (!user) return <FeedView posts={[]} likedIds={[]} onToggleLike={() => {}} />; // 비로그인
  if (isLoading) return <FeedSkeleton />;
  if (isError) return <ErrorFallback error={error} onRetry={refetch} />;
  return <FeedView posts={posts ?? []} likedIds={likedIds ?? []} ... />;
}
```

### 6.2 공통 컴포넌트

```tsx
// FeedSkeleton — 카드 모양 스켈레톤 애니메이션
// ErrorFallback — 에러 메시지 + 재시도 버튼
```

### 6.3 좋아요 버튼 로딩

`useMutation`의 `isPending`으로 연속 클릭 방지:

```tsx
const { mutate: toggleLike, isPending } = useToggleLike(userId);
<button disabled={isPending} onClick={() => toggleLike({ postId, wasLiked })}>
```

---

## 7. Revalidation 전략

| 트리거 | 방식 | 대상 |
|---|---|---|
| 앱 복귀 | `refetchOnWindowFocus: true` (기본값) | 모든 stale 쿼리 |
| 좋아요/게시물 생성 | `invalidateQueries` | feed, myPosts, likedIds |
| 프로필 수정 | optimistic + invalidate | profile |
| 30초 경과 | `staleTime: 30_000` | 자동 백그라운드 리패치 |
| World 진입 | `staleTime: 60_000` | worldGraph |

Pull-to-refresh는 별도 구현 없이 TanStack Query의 `refetch`를 호출:

```tsx
// SwipeFeedView에서 아래로 당기기 제스처
const { refetch } = useFeedQuery(userId);
onPullDown(() => refetch());
```

---

## 8. supabase.ts 변경

### 제거
- 상태 관련 코드 없음 (이미 없음 — 유지)

### 추가
- `getProfile(userId)` 함수 명시적 분리

```ts
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}
```

### mappers.ts 분리

```ts
// lib/mappers.ts
export function toPost(row: FeedRow): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_display_name || 'Anonymous',
    authorAvatar: row.author_avatar_url ?? undefined,
    content: row.content || '',
    media: row.media_url ?? undefined,
    mediaType: row.media_type ?? undefined,
    createdAt: row.created_at,
  };
}
```

---

## 9. 마이그레이션 순서

1. **의존성 설치**: `react-router-dom`, `@tanstack/react-query`
2. **기반 생성**: `queryClient.ts`, `queryKeys.ts`, `mappers.ts`
3. **AuthProvider 분리**: `useAppState`에서 auth만 추출
4. **ClientProvider 분리**: theme, zoom 추출
5. **쿼리 훅 작성**: `useFeed`, `useMyPosts`, `useLikes`, `useWorld`, `useProfile`
6. **라우트 생성**: `Layout`, `FeedRoute`, `WorldRoute`, `MyPageRoute`, `RequireAuth`
7. **App.tsx 재작성**: Provider 계층 + RouterProvider
8. **컴포넌트 업데이트**: 각 뷰가 새 훅 사용
9. **기존 코드 제거**: `useAppState.ts`, `AppState` 타입, `DEFAULT_STATE`
10. **테스트**: 전체 플로우 검증 (로그인/아웃, 뷰 전환, 좋아요, 게시물)

---

## 10. 기대 효과

| 개선 항목 | Before | After |
|---|---|---|
| 브라우저 뒤로가기 | ❌ 불가 | ✅ 자동 |
| URL 공유 | ❌ 불가 | ✅ 가능 |
| feed↔my 전환 | posts 덮어쓰기 | 독립 캐시 |
| 로딩 UI | 빈 화면 | 스켈레톤 |
| 에러 처리 | console.error | 에러 UI + 재시도 |
| 좋아요 race condition | stale closure 위험 | queryClient 안전 |
| World 그래프 | feed 데이터 의존 | 독립 쿼리 |
| 재갱신 | 수동만 | 자동 (focus, stale) |
| 번들 증가 | — | ~15KB (react-router + tanstack-query) |
