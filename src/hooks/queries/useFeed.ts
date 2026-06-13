import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/lib/queryKeys';
import { getFeed } from '@/lib/supabase';
import { toPost } from '@/lib/mappers';
import type { Post } from '@/types';

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
  const key = queryKeys.feed(userId);

  return useCallback((postId: string) => {
    queryClient.setQueryData<Post[]>(key, (old = []) =>
      old.filter(p => p.id !== postId)
    );
  }, [queryClient, key]);
}

export function useRefetchFeed(userId: string) {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.feed(userId) });
  }, [queryClient, userId]);
}
