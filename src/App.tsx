import { useState } from 'react';
import { AppProvider, useApp } from '@/hooks/AppProvider';
import { Header } from '@/components/Header';
import { FeedView } from '@/components/FeedView';
import { ZoomSlider } from '@/components/ZoomSlider';
import { LoginModal } from '@/components/LoginModal';
import { CreatePostModal } from '@/components/CreatePostModal';
import { ProfileModal } from '@/components/ProfileModal';
import { WorldPage } from '@/components/WorldPage';
import { MyPage } from '@/components/MyPage';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

type View = 'feed' | 'world' | 'my';

function AppContent() {
  const { state, logout } = useApp();
  const [currentView, setCurrentView] = useState<View>('feed');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({ authorId: '', content: '' });
  const { toast } = useToast();

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

  const openProfile = (authorId: string, content: string) => {
    setProfileData({ authorId, content });
    setProfileModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out');
  };

  const isLoggedIn = state.currentUser && state.currentUser !== 'guest';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onLoginClick={() => setLoginModalOpen(true)}
      />

      {currentView === 'feed' && (
        <>
          <main className="pt-[60px] w-full h-screen relative flex">
            <FeedView onCardClick={openProfile} onToggleLike={handleToggleLike} onDelete={() => {}} onCreatePostClick={() => setCreatePostModalOpen(true)} />
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

      <ProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        authorId={profileData.authorId}
        content={profileData.content}
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