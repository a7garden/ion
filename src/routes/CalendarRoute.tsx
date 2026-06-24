import { useAuth } from '@/hooks/AuthProvider';
import { useMyPostsQuery, useDeletePost, useUpdatePost, useCreatePost } from '@/hooks/queries/useMyPosts';
import { CalendarPage } from '@/components/CalendarPage';
import { useImageCropper } from '@/hooks/useImageCropper';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LoginModal } from '@/components/LoginModal';
import { useI18n } from '@/i18n';
import { PlanetAvatar } from '@/components/PlanetAvatar';

export function CalendarRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const userId = user?.id ?? '';
  const authorName = user?.displayName ?? '';

  const { data: posts = [], refetch } = useMyPostsQuery(userId);
  const { mutate: deletePostMutate } = useDeletePost(userId);
  const { mutateAsync: updatePostMutate } = useUpdatePost(userId);
  const { mutateAsync: createPostMutate } = useCreatePost(userId, authorName);

  const { CropModal } = useImageCropper();

  const [loginOpen, setLoginOpen] = useState(false);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-card/20 z-[400] overflow-y-auto pt-14 sm:pt-[64px] pb-[var(--safe-area-bottom)] select-none">
        <div className="max-w-[600px] mx-auto px-4 sm:px-5 py-20 text-center">
          <motion.div
            className="relative inline-flex items-center justify-center mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-accent/10 rounded-full blur-2xl" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card border border-border/50 flex items-center justify-center">
              <PlanetAvatar planet="moon" size={64} showGlow className="opacity-40" />
            </div>
          </motion.div>
          <motion.h1
            className="text-lg sm:text-xl font-bold text-foreground"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {t('myPage.guestTitle')}
          </motion.h1>
          <motion.p
            className="text-xs sm:text-sm text-muted-foreground/80 mt-2 whitespace-pre-line"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t('myPage.guestDesc')}
          </motion.p>
          <motion.div
            className="flex flex-col items-center gap-2 mt-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Button
              onClick={() => setLoginOpen(true)}
              className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl touch-target"
            >
              <LogIn className="w-4 h-4" />
              {t('myPage.guestLogin')}
            </Button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('myPage.guestFeed')}
            </button>
          </motion.div>
        </div>
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    );
  }

  return (
    <>
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
      {CropModal}
    </>
  );
}
