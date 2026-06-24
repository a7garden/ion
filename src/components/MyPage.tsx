import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreatePostModal } from '@/components/CreatePostModal';
import { Button } from '@/components/ui/button';
import { Plus, Image, Trash2, Settings, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { toast } from 'sonner';
import { PlanetAvatar } from '@/components/PlanetAvatar';
import { PlanetSelector } from '@/components/PlanetSelector';
import { SettingsModal } from '@/components/SettingsModal';
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog';
import { useI18n } from '@/i18n';
import type { PlanetKey } from '@/constants/planets';
import type { Post } from '@/types';

interface MyPageProps {
  posts: Post[];
  userName: string;
  userPlanet: PlanetKey;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
  onCreatePost: (opts: { content: string; mediaFile?: File }) => Promise<void>;
  onDeletePost: (postId: string) => void;
  onChangeName: (name: string) => Promise<void>;
  onChangePlanet: (planet: PlanetKey) => Promise<void>;
  requestImageCrop: (file: File) => Promise<Blob>;
}

export function MyPage({
  posts,
  userName,
  userPlanet,
  isLoading,
  isError,
  onRetry,
  onLogout,
  onDeleteAccount,
  onCreatePost,
  onDeletePost,
  onChangeName,
  onChangePlanet,
  requestImageCrop,
}: MyPageProps) {
  const { t } = useI18n();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [planetSelectorOpen, setPlanetSelectorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async (postId: string) => {
    setDeletingPostId(postId);
    onDeletePost(postId);
    toast(t('myPage.deleted'), { duration: 2000 });
    setDeletingPostId(null);
  };

  const handleDeleteAccount = async () => {
    setSettingsOpen(false);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-card/20 z-[400] overflow-y-auto pt-14 sm:pt-[64px] pb-[var(--safe-area-bottom)] select-none">
        <div className="max-w-[600px] mx-auto px-4 sm:px-5 py-20 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-card/20 z-[400] overflow-y-auto pt-14 sm:pt-[64px] pb-[var(--safe-area-bottom)] select-none">
        <div className="max-w-[600px] mx-auto px-4 sm:px-5 py-20 text-center">
          <p className="text-muted-foreground mb-4">{t('myPage.failed')}</p>
          <button onClick={onRetry} className="px-4 py-2 bg-accent text-accent-foreground rounded-xl">
            {t('myPage.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-card/20 z-[400] overflow-y-auto pt-14 sm:pt-[64px] pb-[var(--safe-area-bottom)] select-none">
      <div className="max-w-[600px] mx-auto px-4 sm:px-5 pb-10">
        {/* Profile Header */}
        <div className="relative py-6 sm:py-8">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          </div>
          <motion.div
            className="relative flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button onClick={() => setPlanetSelectorOpen(true)} className="group shrink-0">
              <PlanetAvatar planet={userPlanet} size={64} showGlow className="transition-transform group-hover:scale-105" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{userName}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t('myPage.tagline')}</p>
            </div>
            <div className="flex items-center gap-1">
              <NavLink
                to="/calendar"
                className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                aria-label="Calendar"
              >
                <Calendar className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </NavLink>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                aria-label={t('myPage.settings')}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">{t('myPage.myPosts')}</h2>
          <Button variant="outline" size="sm" onClick={() => setCreatePostOpen(true)}
            className="gap-1.5 border-accent/30 hover:bg-accent/10">
            <Plus className="w-4 h-4" /><span>{t('myPage.new')}</span>
          </Button>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Image className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-4">{t('myPage.noPosts')}</p>
            <Button onClick={() => setCreatePostOpen(true)} variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="w-4 h-4 mr-2" />{t('myPage.createFirstPost')}
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {posts.map((post, idx) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="overflow-hidden border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-glow transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    {post.media && (
                      <div className="mb-3 sm:mb-4 rounded-xl overflow-hidden">
                        {post.mediaType === 'video' ? (
                          <video src={post.media} className="w-full max-h-[250px] object-contain" controls />
                        ) : (
                          <img src={post.media} alt="" className="w-full max-h-[250px] object-contain" />
                        )}
                      </div>
                    )}
                    {post.content && (
                      <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-wrap select-text">{post.content}</p>
                    )}
                    <div className="flex items-center justify-end pt-2 border-t border-border/30">
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(post.id)}
                        disabled={deletingPostId === post.id}
                        className="hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreatePostModal
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        onSubmit={onCreatePost}
        requestImageCrop={requestImageCrop}
      />
      <PlanetSelector
        open={planetSelectorOpen}
        onOpenChange={setPlanetSelectorOpen}
        currentPlanet={userPlanet}
        onSelect={onChangePlanet}
      />
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        userName={userName}
        userPlanet={userPlanet}
        onChangeName={onChangeName}
        onChangePlanet={onChangePlanet}
        onLogout={onLogout}
        onDeleteAccount={handleDeleteAccount}
      />
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={async () => {
          await onDeleteAccount();
          setDeleteDialogOpen(false);
        }}
      />
    </div>
  );
}
