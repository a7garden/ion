import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarPage } from '@/components/CalendarPage';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/hooks/AuthProvider';
import { useMyPostsQuery, useDeletePost, useUpdatePost, useCreatePost } from '@/hooks/queries/useMyPosts';
import { useI18n } from '@/i18n';

interface CalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarModal({ open, onOpenChange }: CalendarModalProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const authorName = user?.displayName ?? '';

  const { data: posts = [], refetch } = useMyPostsQuery(userId);
  const { mutate: deletePostMutate } = useDeletePost(userId);
  const { mutateAsync: updatePostMutate } = useUpdatePost(userId);
  const { mutateAsync: createPostMutate } = useCreatePost(userId, authorName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[88vh] max-h-[880px] w-[calc(100vw-1rem)] max-w-[840px] flex-col gap-0 overflow-hidden rounded-2xl border-border/50 p-0 shadow-glow sm:w-[calc(100vw-2rem)] sm:rounded-3xl">
        <DialogHeader className="flex shrink-0 items-center gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
          <CalendarIcon className="h-[18px] w-[18px] text-accent" strokeWidth={1.75} />
          <DialogTitle className="text-base font-semibold text-foreground">{t('calendar.title')}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1">
          {user && (
            <CalendarPage
              posts={posts}
              onDeletePost={(postId) => { deletePostMutate(postId); }}
              onUpdatePost={async (postId, opts) => {
                await updatePostMutate({ postId, ...opts });
                refetch();
              }}
              onCreatePost={async (opts) => {
                await createPostMutate(opts);
                refetch();
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
