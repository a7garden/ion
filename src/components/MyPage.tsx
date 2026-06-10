import { useState } from 'react';
import { useApp } from '@/hooks/AppProvider';
import { Card, CardContent } from '@/components/ui/card';
import { CreatePostModal } from '@/components/CreatePostModal';
import { Button } from '@/components/ui/button';
import { Plus, LogOut } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

interface MyPageProps {
  onLogout: () => void;
}

export function MyPage({ onLogout }: MyPageProps) {
  const { state } = useApp();
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const userPosts = state.posts.filter((post) => post.authorId === state.currentUser);

  return (
    <div className="fixed inset-0 bg-background z-[400] overflow-y-auto pt-[60px]">
      <Sidebar />

      <div className="max-w-[600px] mx-auto px-5 pb-10">
        <div className="flex items-center justify-between mb-6 pt-6">
          <h1 className="text-2xl font-bold text-foreground">My Posts</h1>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setCreatePostOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {userPosts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">No posts yet</p>
            <Button
              onClick={() => setCreatePostOpen(true)}
            >
              Create your first post
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  {post.media && (
                    <div className="mb-3 rounded-lg overflow-hidden">
                      {post.media.includes('video') ? (
                        <video
                          src={post.media}
                          className="w-full max-h-[300px] object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={post.media}
                          alt="Post media"
                          className="w-full max-h-[300px] object-cover"
                        />
                      )}
                    </div>
                  )}
                  <div className="text-sm font-semibold text-foreground mb-2">{post.authorId}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </div>
                    {post.bgm && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>🎵</span>
                        <span>{post.bgm}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
