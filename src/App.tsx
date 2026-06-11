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
import { onAuthChange, getUserProfile } from '@/lib/firebase';
import { upsertUser, getUserByUid, updateUserDisplayName } from '@/lib/neon';

type View = 'feed' | 'world' | 'my';

function AppContent() {
  const { state, logout, toggleLike, login, setUserName, dismissPost, loadRandomPosts } = useApp();
  const [currentView, setCurrentView] = useState<View>('feed');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [setUsernameModalOpen, setSetUsernameModalOpen] = useState(false);
  const [expandedPost, setExpandedPost] = useState<{ post: Post; cardRect: { x: number; y: number; size: number } } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        const profile = getUserProfile(user);
        login(user.uid, 'firebase', profile.displayName);

        try {
          await upsertUser({
            uid: profile.uid,
            display_name: profile.displayName,
            email: profile.email,
            photo_url: profile.photoURL,
          });

          const existingUser = await getUserByUid(profile.uid);
          if (existingUser?.display_name) {
            setUserName(existingUser.display_name);
          }
        } catch (error) {
          console.error('Failed to sync user to Neon:', error);
        }
      }
    });
    return () => unsubscribe();
  }, [login, setUserName]);

  useEffect(() => {
    if (state.currentUser && state.currentUser !== 'guest') {
      loadRandomPosts(state.currentUser, 10);
    }
  }, [state.currentUser, loadRandomPosts]);

  const showToast = (message: string) => {
    toast({
      description: message,
      duration: 2500,
    });
  };

  const notifyAuthor = (postAuthor: string) => {
    setTimeout(() => {
      showToast(`Someone liked ${postAuthor}'s post`);
    }, 500);
  };

  const handleToggleLike = (postId: string, authorId: string) => {
    const currentUser = state.currentUser || 'guest';
    const isLiked = state.userLikes[currentUser]?.includes(postId) || false;

    if (!isLiked) {
      notifyAuthor(authorId);
    }
  };

  const openProfile = (post: Post, cardRect: { x: number; y: number; size: number }) => {
    setExpandedPost({ post, cardRect });
  };

  const closeExpandedCard = () => {
    setExpandedPost(null);
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out');
  };

  const handleDismiss = async (postId: string) => {
    await dismissPost(postId);
    if (state.currentUser) {
      loadRandomPosts(state.currentUser, 1);
    }
  };

  const isLoggedIn = state.currentUser && state.currentUser !== 'guest';

  const handleCreatePostClick = () => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      showToast('게시물을 작성하려면 로그인이 필요합니다');
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
            <FeedView onCardClick={openProfile} onToggleLike={handleToggleLike} onDelete={handleDismiss} onCreatePostClick={handleCreatePostClick} />
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

      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
      />

      <CreatePostModal
        open={createPostModalOpen}
        onOpenChange={setCreatePostModalOpen}
      />

      <ExpandedCard
        open={expandedPost !== null}
        onClose={closeExpandedCard}
        post={expandedPost?.post ?? null}
        isLiked={
          expandedPost
            ? (state.userLikes[state.currentUser || 'guest']?.includes(expandedPost.post.id) ?? false)
            : false
        }
        onToggleLike={() => {
          if (expandedPost) {
            toggleLike(expandedPost.post.id, expandedPost.post.authorId);
          }
        }}
      />

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
