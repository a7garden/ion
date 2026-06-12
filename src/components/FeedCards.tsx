import { useSyncExternalStore, useCallback } from 'react';
import type { Post } from '@/types';
import { useApp } from '@/hooks/AppProvider';
import { positionStore } from '@/stores/positionStore';
import { PostCard } from './PostCard';

interface CardPosition {
  x: number;
  y: number;
  size: number;
}

interface FeedCardsProps {
  onCardClick: (post: Post, cardRect: CardPosition) => void;
  onToggleLike: (postId: string, authorId: string) => void;
  onDelete: (postId: string) => void;
}

export function FeedCards({ onCardClick, onToggleLike, onDelete }: FeedCardsProps) {
  const { state, toggleLike } = useApp();
  const positions = useSyncExternalStore(
    positionStore.subscribe,
    positionStore.getSnapshot
  );
  const deleteModeId = useSyncExternalStore(
    positionStore.subscribe,
    positionStore.getDeleteModeId
  );

  const currentUser = state.currentUser || 'guest';

  const handleDelete = useCallback((posId: string) => {
    onDelete(posId);
    positionStore.setDeleteMode(null);
  }, [onDelete]);

  return (
    <div className="fixed inset-0">
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
            isDeleteMode={deleteModeId === pos.id}
            isLiked={isLiked}
            onClick={() => onCardClick(post, { x: pos.x, y: pos.y, size: pos.size })}
            onToggleLike={() => {
              toggleLike(pos.id, post.authorId);
              onToggleLike(pos.id, post.authorId);
            }}
            onDelete={() => handleDelete(pos.id)}
          />
        );
      })}
    </div>
  );
}
