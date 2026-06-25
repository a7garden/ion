import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getMutualConnections, getFeed } from '@/lib/supabase';
import { toPost } from '@/lib/mappers';
import type { Post } from '@/types';

export interface WorldGraphData {
  connections: string[];
  posts: Post[];
}

export function useWorldGraphQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.worldGraph(userId),
    queryFn: async (): Promise<WorldGraphData> => {
      const [connections, rows] = await Promise.all([
        getMutualConnections(userId),
        getFeed(userId, 200),
      ]);
      return {
        connections,
        posts: rows.map(toPost),
      };
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}
