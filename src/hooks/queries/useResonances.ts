import type { ResonanceRow } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getUnseenResonances, markResonanceSeen, markAllResonancesSeen } from '@/lib/supabase';

export function useUnseenResonancesQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.resonances(userId),
    queryFn: () => getUnseenResonances(userId),
    enabled: !!userId,
    refetchInterval: 30_000, // poll every 30s
  });
}

export function useMarkResonanceSeen(userId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.resonances(userId);

  return useMutation({
    mutationFn: (resonanceId: string) => markResonanceSeen(resonanceId),
    onMutate: async (resonanceId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<ResonanceRow[]>(key) ?? [];
      queryClient.setQueryData<ResonanceRow[]>(key, prev.filter((r) => r.id !== resonanceId));
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(key, context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

export function useMarkAllResonancesSeen(userId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.resonances(userId);

  return useMutation({
    mutationFn: () => markAllResonancesSeen(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<ResonanceRow[]>(key) ?? [];
      queryClient.setQueryData<ResonanceRow[]>(key, []);
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(key, context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
