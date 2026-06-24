import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getUserPosts, createPost, deletePost as deletePostDb, uploadMedia, updatePost as updatePostDb } from '@/lib/supabase';
import { toPost } from '@/lib/mappers';
import type { Post } from '@/types';

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

export function useCreatePost(userId: string, authorName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opts: { content: string; mediaFile?: File }) => {
      let mediaUrl: string | undefined;
      let mediaType: 'image' | 'video' | undefined;

      if (opts.mediaFile) {
        const result = await uploadMedia(opts.mediaFile, userId);
        mediaUrl = result.url;
        mediaType = result.type;
      }

      const row = await createPost({
        author_id: userId,
        content: opts.content,
        media_url: mediaUrl,
        media_type: mediaType,
      });

      return toPost({
        ...row,
        author_display_name: authorName,
      } as any);
    },
    onSuccess: (newPost) => {
      // myPosts에 낙관적 추가
      queryClient.setQueryData<Post[]>(queryKeys.myPosts(userId), (old = []) => [
        newPost,
        ...old,
      ]);
      // feed도 무효화 (새 글이 피드에 나타날 수 있음)
      queryClient.invalidateQueries({ queryKey: queryKeys.feed(userId) });
    },
  });
}

export function useDeletePost(userId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.myPosts(userId);

  return useMutation({
    mutationFn: (postId: string) => deletePostDb(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<Post[]>(key);
      queryClient.setQueryData<Post[]>(key, (old = []) =>
        old.filter(p => p.id !== postId)
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(key, context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed(userId) });
    },
  });
}

export function useUpdatePost(userId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.myPosts(userId);

  return useMutation({
    mutationFn: async ({ postId, content, mediaFile }: { postId: string; content: string; mediaFile?: File }) => {
      let mediaUrl: string | undefined | null;
      let mediaType: 'image' | 'video' | null | undefined;

      if (mediaFile) {
        const result = await uploadMedia(mediaFile, userId);
        mediaUrl = result.url;
        mediaType = result.type;
      }

      const row = await updatePostDb(postId, {
        content,
        media_url: mediaUrl,
        media_type: mediaType,
      });
      return row;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed(userId) });
    },
  });
}
