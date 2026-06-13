import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FeedPhysics } from './FeedPhysics';
import { FeedCards } from './FeedCards';
import { FloatingActionButton } from './FloatingActionButton';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/button';
import type { Post } from '@/types';
import { useApp } from '@/hooks/AppProvider';
import { useDeviceSize, getDynamicCardSize } from '@/hooks/useDeviceSize';

interface CardPosition {
  x: number;
  y: number;
  size: number;
}

interface FeedViewProps {
  onCardClick: (post: Post, cardRect: CardPosition) => void;
  onToggleLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onCreatePostClick: () => void;
  expandedPostId?: string | null;
}

function SwipeFeedView({ onCardClick, onCreatePostClick, onDelete }: FeedViewProps) {
  const { state, toggleLike, removePost } = useApp();
  const { width, height } = useDeviceSize();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const startXRef = useRef(0);
  const currentTranslateXRef = useRef(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const posts = state.posts;
  const currentPost = posts[currentIndex];
  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX - currentTranslateXRef.current;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    longPressTimerRef.current = setTimeout(() => {
      setIsDeleteMode(true);
    }, 500);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    clearLongPressTimer();
    const newTranslateX = e.clientX - startXRef.current;
    currentTranslateXRef.current = newTranslateX;
    setTranslateX(newTranslateX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    clearLongPressTimer();
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (isDeleteMode) {
      setIsDeleteMode(false);
      return;
    }

    const threshold = window.innerWidth * 0.2;
    // 왼쪽 스와이프 → 다음, 오른쪽 스와이프 → 이전 (캐러셀 표준)
    if (translateX < -threshold && currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (translateX > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    setTranslateX(0);
    currentTranslateXRef.current = 0;
  };

  const handleDelete = () => {
    if (currentPost) {
      removePost(currentPost.id);
      onDelete(currentPost.id);
      if (currentIndex >= posts.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
    setIsDeleteMode(false);
  };

  if (!currentPost) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background grain-overlay">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm">No posts yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Create your first post to see it here</p>
          <Button
            onClick={onCreatePostClick}
            className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Create Post
          </Button>
        </div>
      </div>
    );
  }

  const isLiked = state.likedPostIds.includes(currentPost.id);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-card/10 grain-overlay">
      <div
        className="w-full h-full flex items-center justify-center"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="w-full max-w-[380px] sm:max-w-[400px] mx-4"
          style={{
            transform: `translateX(${translateX}px) scale(${isDragging ? 0.96 : 1})`,
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <PostCard
            post={currentPost}
            x={0}
            y={0}
            size={getDynamicCardSize(width, state.zoomLevel)}
            opacity={1}
            isDragging={isDragging}
            isDeleteMode={isDeleteMode}
            isLiked={isLiked}
            onClick={() => {
              if (isDeleteMode) return;
              const rect = { x: width / 2, y: height / 2, size: getDynamicCardSize(width, state.zoomLevel) };
              onCardClick(currentPost, rect);
            }}
            onToggleLike={() => toggleLike(currentPost.id)}
            onDelete={handleDelete}
          />
        </div>
      </div>
      <div className="absolute bottom-24 sm:bottom-20 left-0 right-0 flex justify-center gap-3">
        {posts.map((_, idx) => (
          <motion.div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-accent' : 'w-2 bg-muted'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          />
        ))}
      </div>
      <div className="absolute top-4 left-0 right-0 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card/60 backdrop-blur-sm rounded-full border border-border/50 text-xs text-muted-foreground shadow-sm">
          <span className="font-medium text-foreground">{currentIndex + 1}</span>
          <span>/</span>
          <span>{posts.length}</span>
        </span>
      </div>
    </div>
  );
}

export function FeedView({ onCardClick, onToggleLike, onDelete, onCreatePostClick, expandedPostId }: FeedViewProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    setIsMobile(checkMobile);

    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (isMobile) {
    return (
      <>
        <SwipeFeedView onCardClick={onCardClick} onToggleLike={onToggleLike} onDelete={onDelete} onCreatePostClick={onCreatePostClick} />
        <FloatingActionButton onClick={onCreatePostClick} />
      </>
    );
  }

  return (
    <>
      <FeedPhysics />
      <FeedCards onCardClick={onCardClick} onToggleLike={onToggleLike} onDelete={onDelete} expandedPostId={expandedPostId} />
      <FloatingActionButton onClick={onCreatePostClick} />
    </>
  );
}