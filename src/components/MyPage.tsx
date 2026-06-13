import { useState } from 'react';
import { useApp } from '@/hooks/AppProvider';
import { Card, CardContent } from '@/components/ui/card';
import { CreatePostModal } from '@/components/CreatePostModal';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, Heart, Image, Settings, Check, X, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

interface MyPageProps {
  onLogout: () => void;
}

export function MyPage({ onLogout }: MyPageProps) {
  const { state, deletePost, updateDisplayName } = useApp();
  const { toast } = useToast();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(state.userName || '');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const userPosts = state.posts.filter((post) => post.authorId === state.currentUser);
  const totalLikes = state.posts
    .filter(post => post.authorId === state.currentUser)
    .reduce((count, post) => count + (post.likeCount || 0), 0);

  const handleSaveDisplayName = async () => {
    if (!newDisplayName.trim()) return;
    await updateDisplayName(newDisplayName.trim());
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setNewDisplayName(state.userName || '');
    setIsEditingName(false);
  };

  const handleDeletePost = async (postId: string) => {
    setDeletingPostId(postId);
    try {
      const success = await deletePost(postId);
      if (success) {
        toast({ description: '게시물이 삭제되었습니다', duration: 2000 });
      } else {
        toast({ description: '게시물 삭제에 실패했습니다', duration: 2000 });
      }
    } catch (error) {
      toast({ description: '게시물 삭제에 실패했습니다', duration: 2000 });
    } finally {
      setDeletingPostId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-card/20 z-[400] overflow-y-auto pt-14 sm:pt-[64px] pb-[var(--safe-area-bottom)] grain-overlay">
      <div className="max-w-[600px] mx-auto px-4 sm:px-5 pb-10">
        <div className="relative py-6 sm:py-8 text-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          </div>

          <motion.div
            className="relative inline-flex flex-col items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg warm-glow">
              <span className="text-xl sm:text-2xl font-bold text-primary-foreground">
                {(state.userName || state.currentUser)?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="w-32 sm:w-40 text-center rounded-xl"
                    maxLength={20}
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={handleSaveDisplayName} className="touch-target">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="touch-target">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">{state.userName || state.currentUser}</h1>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingName(true)} className="touch-target">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Alone, but not lonely</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 mt-2">
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold text-foreground">{userPosts.length}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="w-px h-6 sm:h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold text-foreground">{totalLikes}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">My Posts</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreatePostOpen(true)}
              className="gap-1.5 sm:gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent/50 transition-all touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="gap-1.5 sm:gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors touch-target"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {userPosts.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Image className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-4">No posts yet</p>
            <Button
              onClick={() => setCreatePostOpen(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground transition-colors"
            >
<Plus className="w-4 h-4 mr-2" />
              Create your first post
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {userPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden border-border/50 hover:border-accent/30 transition-all duration-300 warm-glow-hover">
                  <CardContent className="p-3 sm:p-4">
                    {post.media && (
                      <div className="mb-3 sm:mb-4 rounded-xl overflow-hidden">
                        <img
                          src={post.media}
                          alt="Post media"
                          className="w-full max-h-[200px] sm:max-h-[250px] object-cover"
                        />
                      </div>
                    )}
                    <p className="text-sm text-foreground leading-relaxed mb-3 sm:mb-4 whitespace-pre-wrap">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border/30">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Heart className="w-3.5 h-3.5" />
                          <span>
                            {post.likeCount || 0} likes
                          </span>
                        </div>
                        {post.bgm && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                            <span className="text-base">🎵</span>
                            <span className="truncate max-w-[80px] sm:max-w-[120px]">{post.bgm}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingPostId === post.id}
                        className="hover:bg-destructive/10 hover:text-destructive transition-colors touch-target"
                      >
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
      />
    </div>
  );
}
