import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreatePostModal } from '@/components/CreatePostModal';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, Image, Settings, Check, X, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { PlanetAvatar } from '@/components/PlanetAvatar';
import { PlanetSelector } from '@/components/PlanetSelector';
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog';
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
  const { toast } = useToast();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(userName || '');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [planetSelectorOpen, setPlanetSelectorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSaveName = async () => {
    if (!newDisplayName.trim()) return;
    await onChangeName(newDisplayName.trim());
    setIsEditingName(false);
  };

  const handleDelete = async (postId: string) => {
    setDeletingPostId(postId);
    onDeletePost(postId);
    toast({ description: '삭제되었습니다', duration: 2000 });
    setDeletingPostId(null);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-card/20 z-[400] overflow-y-auto pt-14 sm:pt-[64px] pb-[var(--safe-area-bottom)] grain-overlay">
        <div className="max-w-[600px] mx-auto px-4 sm:px-5 py-20 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-card/20 z-[400] overflow-y-auto pt-14 sm:pt-[64px] pb-[var(--safe-area-bottom)] grain-overlay">
        <div className="max-w-[600px] mx-auto px-4 sm:px-5 py-20 text-center">
          <p className="text-muted-foreground mb-4">게시물을 불러오지 못했습니다</p>
          <button onClick={onRetry} className="px-4 py-2 bg-accent text-accent-foreground rounded-xl">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-card/20 z-[400] overflow-y-auto pt-14 sm:pt-[64px] pb-[var(--safe-area-bottom)] grain-overlay">
      <div className="max-w-[600px] mx-auto px-4 sm:px-5 pb-10">
        {/* Profile */}
        <div className="relative py-6 sm:py-8 text-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          </div>
          <motion.div
            className="relative inline-flex flex-col items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button onClick={() => setPlanetSelectorOpen(true)} className="group">
              <PlanetAvatar planet={userPlanet} size={80} showGlow className="transition-transform group-hover:scale-105" />
            </button>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)}
                    className="w-32 sm:w-40 text-center rounded-xl" maxLength={20} autoFocus />
                  <Button size="sm" variant="ghost" onClick={handleSaveName}><Check className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { setNewDisplayName(userName || ''); setIsEditingName(false); }}><X className="w-4 h-4" /></Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">{userName}</h1>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingName(true)}><Settings className="w-4 h-4" /></Button>
                </div>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Alone, but not lonely</p>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">My Posts</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreatePostOpen(true)}
              className="gap-1.5 border-accent/30 hover:bg-accent/10">
              <Plus className="w-4 h-4" /><span>New</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}
              className="gap-1.5 hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="w-4 h-4" /><span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Image className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-4">No posts yet</p>
            <Button onClick={() => setCreatePostOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="w-4 h-4 mr-2" />Create your first post
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {posts.map((post, idx) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="overflow-hidden border-border/50 hover:border-accent/30 transition-all duration-300 warm-glow-hover">
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
                      <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
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
      <PlanetSelector open={planetSelectorOpen} onOpenChange={setPlanetSelectorOpen} currentPlanet={userPlanet} onSelect={onChangePlanet} />
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={async () => {
          await onDeleteAccount();
          setDeleteDialogOpen(false);
        }}
      />

      <div className="max-w-[600px] mx-auto px-4 sm:px-5 pb-8 pt-4 flex justify-center">
        <button
          onClick={() => setDeleteDialogOpen(true)}
          className="text-xs text-muted-foreground/60 hover:text-destructive transition-colors duration-200 underline-offset-4 hover:underline"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
