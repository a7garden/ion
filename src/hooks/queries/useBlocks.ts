import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getBlockedUserIds, blockUser, unblockUser } from '@/lib/supabase';

export function useBlockedIdsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.blockedIds(userId),
    queryFn: () => getBlockedUserIds(userId),
    enabled: !!userId,
  });
}

export function useToggleBlock(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ blockedId, wasBlocked }: { blockedId: string; wasBlocked: boolean }) => {
      if (wasBlocked) await unblockUser(userId, blockedId);
      else await blockUser(userId, blockedId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blockedIds(userId) });
    },
  });
}
