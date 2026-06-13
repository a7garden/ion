import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { queryKeys } from '@/lib/queryKeys';
import { getFeed } from '@/lib/supabase';
import { toPost } from '@/lib/mappers';
import { useClient } from '@/hooks/ClientProvider';
import { useDeviceSize, getDynamicCardSize, getCardCountForViewport } from '@/hooks/useDeviceSize';
import type { Post } from '@/types';

// 세션 내에서 치운(dismiss) post id 추적. 사용자별로 격리.
// 영속화하지 않으므로 새로고침하면 초기화. 새 카드 보충/재fetch 시 제외 대상으로 사용.
const dismissedByUser = new Map<string, Set<string>>();
function getDismissed(userId: string): Set<string> {
  let s = dismissedByUser.get(userId);
  if (!s) { s = new Set(); dismissedByUser.set(userId, s); }
  return s;
}

// 사용자별 보충(fetch) 직렬화 체인. 빠른 연속 dismiss에서 보충 fetch가 동시에 날아가
// exclude 계산이 엇나가 같은 post가 중복 보충되는(race condition) 것을 막는다.
const refillChainByUser = new Map<string, Promise<void>>();

export function useFeedQuery(userId: string) {
  const { zoomLevel } = useClient();
  const { width, height } = useDeviceSize();

  // 화면에 띄워야 할 카드 수(k) + 여유분을 한 번에 가져온다.
  // k보다 작으면 dismiss 보충을 해도 풀이 부족해 "반대편 투입"이 안 일어난다.
  const batchSize = useMemo(() => {
    const cardSize = getDynamicCardSize(width, zoomLevel);
    const k = getCardCountForViewport(width, height, cardSize);
    return Math.max(k + 8, 16);
  }, [width, height, zoomLevel]);

  return useQuery({
    queryKey: queryKeys.feed(userId),
    queryFn: async () => {
      const rows = await getFeed(userId, batchSize, Array.from(getDismissed(userId)));
      return rows.map(toPost);
    },
    enabled: !!userId,
  });
}

export function useDismissPost(userId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.feed(userId);

  return useCallback(
    (postId: string) => {
      const dismissedIds = getDismissed(userId);
      dismissedIds.add(postId);

      // 1) 즉시 캐시에서 제거 — 반응성 (FeedPhysics가 dismiss 애니메이션 + 반대편 스폰 예약)
      queryClient.setQueryData<Post[]>(key, (old = []) =>
        old.filter((p) => p.id !== postId)
      );

      // 2) 풀 보충 — 직렬화 체인으로 묶어 빠른 연속 dismiss에도 중복 없이 1개씩만 추가.
      //    각 보충은 이전 보충 완료 후 실행되므로 항상 최신 캐시 기준으로 exclude 계산.
      const run = async () => {
        const current = queryClient.getQueryData<Post[]>(key) ?? [];
        const excludeIds = new Set([...current.map((p) => p.id), ...dismissedIds]);
        try {
          const rows = await getFeed(userId, 1, Array.from(excludeIds));
          // 이중 방어: 서버가 exclude를 무시하고 돌려줘도 여기서 한 번 더 걸름
          const fresh = rows.map(toPost).filter((p) => !excludeIds.has(p.id));
          if (fresh.length > 0) {
            queryClient.setQueryData<Post[]>(key, (old = []) => {
              const existing = new Set(old.map((p) => p.id));
              const deduped = fresh.filter((p) => !existing.has(p.id));
              return deduped.length > 0 ? [...old, ...deduped] : old;
            });
          }
          // 보충할 post가 없다면(풀 고갈) 그대로 둠 — k개 미달이지만 복구 불가.
        } catch {
          // 보충 실패해도 dismiss 자체는 유지
        }
      };
      const prev = refillChainByUser.get(userId) ?? Promise.resolve();
      refillChainByUser.set(userId, prev.then(run));
    },
    [queryClient, key, userId]
  );
}

export function useRefetchFeed(userId: string) {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.feed(userId) });
  }, [queryClient, userId]);
}
