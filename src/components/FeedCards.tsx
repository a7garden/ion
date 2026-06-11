import { useSyncExternalStore, useRef, useCallback, useState } from 'react';
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

  const currentUser = state.currentUser || 'guest';
  const [deleteModeId, setDeleteModeId] = useState<string | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartYRef = useRef<number>(0);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, pos: typeof positions[0]) => {
    e.stopPropagation();
    clearLongPressTimer();
    dragStartYRef.current = e.clientY;
    longPressTimerRef.current = setTimeout(() => {
      setDeleteModeId(pos.id);
    }, 500);
  }, [clearLongPressTimer]);

  const handlePointerUp = useCallback((e: React.PointerEvent, pos: typeof positions[0]) => {
    clearLongPressTimer();
    const dy = e.clientY - dragStartYRef.current;
    if (dy >= 100 && deleteModeId === pos.id) {
      onDelete(pos.id);
    }
    setDeleteModeId(null);
  }, [clearLongPressTimer, deleteModeId, onDelete]);

  return (
    <div
      className="fixed inset-0"
      onPointerUp={(e) => {
        const pos = positions.find(p => p.isDragging);
        if (pos) handlePointerUp(e, pos);
      }}
      onPointerLeave={clearLongPressTimer}
    >
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
            onPointerDown={(e) => handlePointerDown(e, pos)}
            onClick={() => onCardClick(post, { x: pos.x, y: pos.y, size: pos.size })}
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
