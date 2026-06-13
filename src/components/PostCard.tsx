import { useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Post } from '@/types';
import { positionStore } from '@/stores/positionStore';

interface PostCardProps {
  post: Post;
  x: number;
  y: number;
  size: number;
  opacity: number;
  isDragging: boolean;
  isDeleteMode?: boolean;
  isLiked: boolean;
  onClick: () => void;
  onToggleLike: () => void;
  onDelete?: () => void;
}

export function PostCard({
  post,
  x,
  y,
  size = 150,
  opacity,
  isDragging,
  isDeleteMode,
  isLiked,
  onClick,
  onToggleLike,
  onDelete,
}: PostCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const prevDragRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentRotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const rotationFrameRef = useRef<number | undefined>(undefined);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // 회전 스프링 애니메이션 — CSS custom property만 업데이트
  // 위치(x,y)는 React style prop이 관리하므로 stale closure 문제 없음
  const animateRotation = useCallback(() => {
    const diff = targetRotationRef.current - currentRotationRef.current;
    if (Math.abs(diff) < 0.1) {
      currentRotationRef.current = targetRotationRef.current;
      containerRef.current?.style.setProperty('--drag-rotation', `${currentRotationRef.current}deg`);
      rotationFrameRef.current = undefined;
      return;
    }
    currentRotationRef.current += diff * 0.15;
    containerRef.current?.style.setProperty('--drag-rotation', `${currentRotationRef.current}deg`);
    rotationFrameRef.current = requestAnimationFrame(animateRotation);
  }, []);

  const startRotationAnim = useCallback((target: number) => {
    targetRotationRef.current = target;
    if (!rotationFrameRef.current) {
      rotationFrameRef.current = requestAnimationFrame(animateRotation);
    }
  }, [animateRotation]);

  // 언마운트 시 rAF 정리
  useEffect(() => {
    return () => {
      if (rotationFrameRef.current) cancelAnimationFrame(rotationFrameRef.current);
    };
  }, []);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    clearLongPress();
    isDraggingRef.current = true;
    hasMovedRef.current = false;

    // 마우스와 카드 중심 사이의 오프셋 저장 (카드가 마우스로 튀는 것 방지)
    dragOffsetRef.current = { x: e.clientX - x, y: e.clientY - y };

    dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    prevDragRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };

    positionStore.setDragging(post.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    // 롱프레스 → 삭제 모드
    longPressTimerRef.current = setTimeout(() => {
      if (isDraggingRef.current) {
        positionStore.setDeleteMode(post.id);
      }
    }, 600);
  }, [post.id, x, y, clearLongPress]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const now = Date.now();
    const newX = e.clientX;
    const newY = e.clientY;

    // 움직임 감지 (클릭 vs 드래그 구분)
    if (dragStartRef.current) {
      const dx = newX - dragStartRef.current.x;
      const dy = newY - dragStartRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        hasMovedRef.current = true;
        clearLongPress();
      }
    }

    // 오프셋을 고려한 카드 중심 위치
    let centerX = newX - dragOffsetRef.current.x;
    let centerY = newY - dragOffsetRef.current.y;

    // 헤더 영역 아래로 제한
    const TOP_OFFSET = 72;
    centerX = Math.max(size / 2, Math.min(window.innerWidth - size / 2, centerX));
    centerY = Math.max(TOP_OFFSET + size / 2, Math.min(window.innerHeight - size / 2, centerY));

    // 속도 계산
    if (prevDragRef.current) {
      const dt = Math.max(1, now - prevDragRef.current.time);
      const vx = (newX - prevDragRef.current.x) / dt * 16;
      const vy = (newY - prevDragRef.current.y) / dt * 16;
      positionStore.setDragVelocity(post.id, vx, vy);

      // 드래그 중 회전: 수평 속도에 비례
      const targetRotation = Math.max(-12, Math.min(12, vx * 3));
      startRotationAnim(targetRotation);
    }

    prevDragRef.current = { x: newX, y: newY, time: now };

    // 위치 업데이트 — React style prop이 transform을 관리
    positionStore.updateSinglePosition(post.id, centerX, centerY);
  }, [post.id, clearLongPress, startRotationAnim]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    clearLongPress();
    isDraggingRef.current = false;

    const deleteModeId = positionStore.getDeleteModeId();
    if (deleteModeId === post.id) {
      positionStore.setDragging(null);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      return;
    }

    positionStore.setDragging(null);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (!hasMovedRef.current) {
      onClick();
    }

    // 놓을 때 회전 복귀 (스프링)
    startRotationAnim(0);
  }, [post.id, onClick, clearLongPress, startRotationAnim]);

  return (
    <div
      ref={containerRef}
      className={`absolute pointer-events-auto ${isDragging ? 'cursor-grabbing z-10' : 'cursor-grab'}`}
      style={{
        width: size,
        height: size,
        left: 0,
        top: 0,
        '--drag-rotation': `${currentRotationRef.current}deg`,
        transform: `translate3d(${x - size / 2}px, ${y - size / 2}px, 0) scale(${isDragging ? 1.08 : 1}) rotate(var(--drag-rotation, 0deg))`,
        opacity,
        transition: isDragging
          ? 'box-shadow 0.3s ease'
          : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease',
        touchAction: 'none',
        willChange: 'transform',
      } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <motion.div
        layoutId={`card-${post.id}`}
        className={`w-full h-full bg-card rounded-2xl p-4 flex flex-col overflow-hidden transition-all duration-300 select-none ${
          isDeleteMode ? 'border-2 border-destructive' : 'border border-border/50'
        }`}
        style={{
          boxShadow: isDeleteMode
            ? '0 0 30px hsl(var(--destructive) / 0.4)'
            : isDragging
            ? '0 20px 60px hsl(var(--warm-shadow) / 0.3), 0 0 25px hsl(var(--gold-glow) / 0.2)'
            : 'var(--shadow-md)',
        }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {post.media && (
          <div className="mb-3 flex-shrink-0 relative">
            <div className="relative overflow-hidden rounded-xl">
              {(post.mediaType === 'video') ? (
                <div className="relative">
                  <video
                    src={post.media}
                    className="w-full aspect-square object-cover transition-transform duration-300"
                    preload="metadata"
                    playsInline
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={post.media}
                  alt="Post media"
                  className="w-full aspect-square object-cover transition-transform duration-300"
                  draggable={false}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        <div className="text-[11px] font-medium text-muted-foreground/80 flex-1 overflow-hidden line-clamp-4 leading-relaxed">
          {post.content}
        </div>

        <div className="flex justify-center mt-auto pt-3 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
            className="relative p-2 -mt-1 rounded-full hover:bg-accent/10 transition-colors duration-200"
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
          >
            <motion.svg
              className={`w-5 h-5 transition-all duration-300 ${
                isLiked
                  ? 'fill-destructive stroke-destructive'
                  : 'fill-none stroke-muted-foreground/60 hover:stroke-accent'
              }`}
              viewBox="0 0 24 24"
              animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </motion.svg>
            {isLiked && (
              <motion.div
                className="absolute inset-0 rounded-full bg-destructive/20 blur-md"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        </div>

        {isDeleteMode && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </motion.div>

      {isDragging && (
        <div className="absolute -inset-1 rounded-2xl border-2 border-accent/30 blur-sm pointer-events-none animate-pulse-slow" />
      )}
    </div>
  );
}
