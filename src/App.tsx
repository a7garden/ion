import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/hooks/AppProvider';
import { Header } from '@/components/Header';
import { FeedView } from '@/components/FeedView';
import { ZoomSlider } from '@/components/ZoomSlider';
import { LoginModal } from '@/components/LoginModal';
import { CreatePostModal } from '@/components/CreatePostModal';
import { ExpandedCard } from '@/components/ExpandedCard';
import { WorldPage } from '@/components/WorldPage';
import { MyPage } from '@/components/MyPage';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import type { Post } from '@/types';

type View = 'feed' | 'world' | 'my';

function AppContent() {
  const { state, logout, toggleLike, loadFeed, loadMyPosts, dismissPost } = useApp();
  const [currentView, setCurrentView] = useState<View>('feed');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [expandedPost, setExpandedPost] = useState<Post | null>(null);
  const { toast } = useToast();

  // MyPage 진입 시 내 게시물 로드
  useEffect(() => {
    if (currentView === 'my' && state.currentUser) {
      loadMyPosts(state.currentUser);
    }
  }, [currentView, state.currentUser, loadMyPosts]);

  const isLoggedIn = !!state.currentUser;

  const handleToggleLike = async (postId: string) => {
    await toggleLike(postId);
  };

  const handleLogout = async () => {
    await logout();
    toast({ description: 'Logged out', duration: 2000 });
  };

  const handleDismiss = async (postId: string) => {
    await dismissPost(postId);
    if (state.currentUser) loadFeed(state.currentUser, 1);
  };

  const handleCreatePostClick = () => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      toast({ description: '게시물을 작성하려면 로그인이 필요합니다', duration: 2000 });
      return;
    }
    setCreatePostModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 grain-overlay">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/5 opacity-30" />
      </div>

      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onLoginClick={() => setLoginModalOpen(true)}
      />

      {currentView === 'feed' && (
        <>
          <main className="pt-14 sm:pt-[64px] w-full h-screen relative flex">
            <FeedView
              onCardClick={(post) => setExpandedPost(post)}
              onToggleLike={handleToggleLike}
              onDelete={handleDismiss}
              onCreatePostClick={handleCreatePostClick}
            />
          </main>
          <ZoomSlider />
        </>
      )}

      {currentView === 'world' && (
        <>
          <WorldPage />
          <ZoomSlider />
        </>
      )}

      {currentView === 'my' && isLoggedIn && (
        <MyPage onLogout={handleLogout} />
      )}

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      <CreatePostModal open={createPostModalOpen} onOpenChange={setCreatePostModalOpen} />

      <ExpandedCard
        open={expandedPost !== null}
        onClose={() => setExpandedPost(null)}
        post={expandedPost}
        isLiked={expandedPost ? state.likedPostIds.includes(expandedPost.id) : false}
        onToggleLike={() => expandedPost && toggleLike(expandedPost.id)}
      />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
