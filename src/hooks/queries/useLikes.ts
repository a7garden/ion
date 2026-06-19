import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getMyLikedPostIds, likePost, unlikePost, checkAndCreateResonance } from '@/lib/supabase';

export function useLikedIdsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.likedIds(userId),
    queryFn: () => getMyLikedPostIds(userId),
    enabled: !!userId,
  });
}

export function useToggleLike(userId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.likedIds(userId);

  return useMutation({
    mutationFn: async ({ postId, wasLiked }: { postId: string; wasLiked: boolean }) => {
      if (wasLiked) {
        await unlikePost(userId, postId);
      } else {
        await likePost(userId, postId);
        // Check for resonance after liking
        try {
          const resonance = await checkAndCreateResonance(userId, postId);
          if (resonance) {
            queryClient.invalidateQueries({ queryKey: queryKeys.resonances(userId) });
          }
        } catch {
          // Resonance check failure should not block the like
        }
      }
    },
    onMutate: async ({ postId, wasLiked }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<string[]>(key);
      queryClient.setQueryData<string[]>(key, (old = []) =>
        wasLiked ? old.filter(id => id !== postId) : [...old, postId]
      );
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
