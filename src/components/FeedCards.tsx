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
  onToggleLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  expandedPostId?: string | null;
}

export function FeedCards({ onCardClick, onToggleLike, onDelete, expandedPostId }: FeedCardsProps) {
  const { state } = useApp();
  const positions = useSyncExternalStore(
    positionStore.subscribe,
    positionStore.getSnapshot
  );
// deleteModeId를 positions 변경 시 함께 계산하여 불필요한 리렌더링 방지
  const deleteModeId = positions.length > 0 ? positionStore.getDeleteModeId() : null;


  const handleDelete = useCallback((posId: string) => {
    onDelete(posId);
    positionStore.setDeleteMode(null);
  }, [onDelete]);

  return (
    <div className="fixed inset-0">
      {positions.map((pos) => {
        const post = state.posts.find((p) => p.id === pos.id);
        if (!post) return null;

        // 확장된 카드는 렌더링하지 않음 (layoutId 충돌 방지)
        if (expandedPostId && pos.id === expandedPostId) return null;

        const isLiked = state.likedPostIds.includes(pos.id);

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
            onToggleLike={() => onToggleLike(pos.id)}
            onDelete={() => handleDelete(pos.id)}
          />
        );
      })}
    </div>
  );
}
