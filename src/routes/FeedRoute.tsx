import { useState, useEffect, startTransition } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthProvider';
import { useFeedQuery, useDismissPost, useRefetchFeed } from '@/hooks/queries/useFeed';
import { useLikedIdsQuery, useToggleLike } from '@/hooks/queries/useLikes';
import { useCreatePost } from '@/hooks/queries/useMyPosts';
import { FeedView } from '@/components/FeedView';
import { FeedSkeleton } from '@/components/ui/skeleton';
import { ZoomSlider } from '@/components/ZoomSlider';
import { LoginModal } from '@/components/LoginModal';
import { CreatePostModal } from '@/components/CreatePostModal';
import { ExpandedCard } from '@/components/ExpandedCard';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { useI18n } from '@/i18n';
import { useImageCropper } from '@/hooks/useImageCropper';

export function FeedRoute() {
  const { t } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const userId = user?.id ?? '';
  const authorName = user?.displayName ?? '';

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const { requestCrop, CropModal } = useImageCropper();

  useEffect(() => {
    if (location.state?.showLogin) {
      startTransition(() => {
        setLoginModalOpen(true);
      });
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const { data: posts = [], isLoading: feedLoading, isError, refetch } = useFeedQuery(userId);
  const { data: likedIds = [] } = useLikedIdsQuery(userId);
  const dismissPost = useDismissPost(userId);
  const refetchFeed = useRefetchFeed(userId);
  const { mutate: toggleLike } = useToggleLike(userId);
  const { mutateAsync: createPostMutate } = useCreatePost(userId, authorName);

  const isLoggedIn = !!user;
  const expandedPost = expandedPostId ? posts.find(p => p.id === expandedPostId) ?? null : null;

  const handleToggleLike = (postId: string) => {
    if (!isLoggedIn) { setLoginModalOpen(true); return; }
    const wasLiked = likedIds.includes(postId);
    toggleLike({ postId, wasLiked });
  };

  const handleDismiss = (postId: string) => {
    dismissPost(postId);
  };

  const handleCreatePostClick = () => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    setCreatePostModalOpen(true);
  };

  const handleCardClick = (post: { id: string }) => {
    setExpandedPostId(post.id);
  };

  if (authLoading || feedLoading) {
    return <FeedSkeleton />;
  }

  if (isError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('feedRoute.failed')}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-accent text-accent-foreground rounded-xl">
            {t('feedRoute.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="pt-14 sm:pt-[64px] w-full h-screen relative flex">
        <FeedView
          posts={posts}
          onCardClick={handleCardClick}
          onDelete={handleDismiss}
          onCreatePostClick={handleCreatePostClick}
          expandedPostId={expandedPostId}
          onRefetch={refetchFeed}
          likedIds={likedIds}
          onToggleLike={handleToggleLike}
        />
      </main>
      <ZoomSlider />
      <FloatingActionButton onClick={handleCreatePostClick} />

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      <CreatePostModal
        open={createPostModalOpen}
        onOpenChange={setCreatePostModalOpen}
        onSubmit={async (opts) => { await createPostMutate(opts); }}
        requestImageCrop={requestCrop}
      />
      {CropModal}

      <ExpandedCard
        open={expandedPost !== null}
        onClose={() => setExpandedPostId(null)}
        post={expandedPost}
        isLiked={expandedPost ? likedIds.includes(expandedPost.id) : false}
        onToggleLike={() => expandedPost && handleToggleLike(expandedPost.id)}
      />
    </>
  );
}
