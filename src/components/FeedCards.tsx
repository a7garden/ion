import { useSyncExternalStore } from 'react';
import { useApp } from '@/hooks/AppProvider';
import { positionStore } from '@/stores/positionStore';
import { PostCard } from './PostCard';

interface FeedCardsProps {
  onCardClick: (authorId: string, content: string) => void;
  onToggleLike: (postId: string, authorId: string) => void;
}

export function FeedCards({ onCardClick, onToggleLike }: FeedCardsProps) {
  const { state, toggleLike } = useApp();
  const positions = useSyncExternalStore(
    positionStore.subscribe,
    positionStore.getSnapshot
  );

  const currentUser = state.currentUser || 'guest';

  return (
    <div className="fixed inset-0 pointer-events-none">
      {positions.map((pos) => {
        const post = state.posts.find((p) => p.id === pos.id);
        if (!post) return null;

        const isLiked = state.userLikes[currentUser]?.includes(pos.id) || false;

        return (
          <PostCard
            key={pos.id}
            post={post}
            x={pos.x}
            y={pos.y}
            size={pos.size}
            opacity={pos.opacity}
            isDragging={pos.isDragging}
            isLiked={isLiked}
            onClick={() => onCardClick(post.authorId, post.content)}
            onToggleLike={() => {
              toggleLike(pos.id, post.authorId);
              onToggleLike(pos.id, post.authorId);
            }}
          />
        );
      })}
    </div>
  );
}
