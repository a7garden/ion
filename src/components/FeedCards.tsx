import { useSyncExternalStore, useCallback } from 'react';
import type { Post } from '@/types';
import { positionStore } from '@/stores/positionStore';
import { PostCard } from './PostCard';

interface CardPosition {
  x: number;
  y: number;
  size: number;
}

interface FeedCardsProps {
  posts: Post[];
  onCardClick: (post: Post, cardRect: CardPosition) => void;
  onDelete: (postId: string) => void;
  expandedPostId?: string | null;
}

export function FeedCards({ posts, onCardClick, onDelete, expandedPostId }: FeedCardsProps) {
  const positions = useSyncExternalStore(
    positionStore.subscribe,
    positionStore.getSnapshot
  );
  const deleteModeId = positions.length > 0 ? positionStore.getDeleteModeId() : null;

  const handleDelete = useCallback((posId: string) => {
    onDelete(posId);
    positionStore.setDeleteMode(null);
  }, [onDelete]);

  return (
    <div className="fixed inset-0">
      {positions.map((pos) => {
        const post = posts.find((p) => p.id === pos.id);
        if (!post) return null;

        if (expandedPostId && pos.id === expandedPostId) return null;

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
            onClick={() => onCardClick(post, { x: pos.x, y: pos.y, size: pos.size })}
            onDelete={() => handleDelete(pos.id)}
          />
        );
      })}
    </div>
  );
}
