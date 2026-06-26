import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarPage } from '@/components/CalendarPage';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/hooks/AuthProvider';
import { useMyPostsQuery, useDeletePost, useUpdatePost } from '@/hooks/queries/useMyPosts';
import { useI18n } from '@/i18n';

interface CalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarModal({ open, onOpenChange }: CalendarModalProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const { data: posts = [], refetch } = useMyPostsQuery(userId);
  const { mutate: deletePostMutate } = useDeletePost(userId);
  const { mutateAsync: updatePostMutate } = useUpdatePost(userId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[88vh] max-h-[820px] w-[calc(100vw-1rem)] max-w-[640px] flex-col gap-0 overflow-hidden rounded-2xl border-border/50 bg-card/95 p-0 shadow-glow backdrop-blur-xl sm:w-[calc(100vw-2rem)] sm:rounded-3xl">
        <DialogHeader className="flex shrink-0 items-center justify-center border-b border-border/30 px-5 py-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
            <CalendarIcon className="h-[15px] w-[15px] text-accent" />
          </div>
          <DialogTitle className="sr-only">{t('calendar.title')}</DialogTitle>
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
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
