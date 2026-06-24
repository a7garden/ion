import { useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Post } from '@/types';
import { positionStore } from '@/stores/positionStore';
import { PlanetAvatar } from '@/components/PlanetAvatar';
import { useI18n } from '@/i18n';

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

async function handleShare(post: Post) {
  const shareData = {
    title: 'ION',
    text: post.content,
    url: post.media || undefined,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch {
      // User cancelled
    }
  } else {
    await navigator.clipboard.writeText(post.content);
  }
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
  const { t } = useI18n();
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
  const nearEdgeRef = useRef<'left' | 'right' | 'top' | 'bottom' | null>(null);

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
    nearEdgeRef.current = null;

    dragOffsetRef.current = { x: e.clientX - x, y: e.clientY - y };
    dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    prevDragRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };

    positionStore.setDragging(post.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

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

    if (dragStartRef.current) {
      const dx = newX - dragStartRef.current.x;
      const dy = newY - dragStartRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        hasMovedRef.current = true;
        clearLongPress();
      }
    }

    const rawCenterX = newX - dragOffsetRef.current.x;
    const rawCenterY = newY - dragOffsetRef.current.y;
    let centerX = rawCenterX;
    let centerY = rawCenterY;

    const TOP_OFFSET = 72;
    const minX = size / 2;
    const maxX = window.innerWidth - size / 2;
    const minY = TOP_OFFSET + size / 2;
    const maxY = window.innerHeight - size / 2;
    centerX = Math.max(minX, Math.min(maxX, centerX));
    centerY = Math.max(minY, Math.min(maxY, centerY));

    if (rawCenterX < minX) nearEdgeRef.current = 'left';
    else if (rawCenterX > maxX) nearEdgeRef.current = 'right';
    else if (rawCenterY < minY) nearEdgeRef.current = 'top';
    else if (rawCenterY > maxY) nearEdgeRef.current = 'bottom';
    else nearEdgeRef.current = null;

    if (prevDragRef.current) {
      const dt = Math.max(1, now - prevDragRef.current.time);
      const vx = (newX - prevDragRef.current.x) / dt * 16;
      const vy = (newY - prevDragRef.current.y) / dt * 16;
      positionStore.setDragVelocity(post.id, vx, vy);

      const targetRotation = Math.max(-12, Math.min(12, vx * 3));
      startRotationAnim(targetRotation);
    }

    prevDragRef.current = { x: newX, y: newY, time: now };
    positionStore.updateSinglePosition(post.id, centerX, centerY);
  }, [post.id, clearLongPress, startRotationAnim]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    clearLongPress();
    isDraggingRef.current = false;

    const edge = nearEdgeRef.current;
    if (hasMovedRef.current && edge) {
      const edgeDir: Record<'left' | 'right' | 'top' | 'bottom', { vx: number; vy: number }> = {
        left: { vx: -1, vy: 0 },
        right: { vx: 1, vy: 0 },
        top: { vx: 0, vy: -1 },
        bottom: { vx: 0, vy: 1 },
      };
      const dir = edgeDir[edge];
      const vel = positionStore.getDragVelocity(post.id) ?? { vx: 0, vy: 0 };
      positionStore.markForDismissal(post.id, dir.vx * 4 + vel.vx * 0.3, dir.vy * 4 + vel.vy * 0.3);
      positionStore.setDragging(null);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      return;
    }

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

    nearEdgeRef.current = null;
    startRotationAnim(0);
  }, [post.id, onClick, clearLongPress, startRotationAnim]);

  const getCardShadow = () => {
    if (isDeleteMode) {
      return '0 0 30px hsla(5, 65%, 48%, 0.4)';
    }
    if (isDragging) {
      return '0 20px 60px hsla(25, 15%, 35%, 0.3), 0 0 25px hsla(330, 65%, 55%, 0.25)';
    }
    return '0 4px 20px hsla(225, 45%, 40%, 0.12), 0 0 40px hsla(275, 60%, 55%, 0.15)';
  };

  return (
    <div
      ref={containerRef}
      className={`absolute pointer-events-auto select-none ${isDragging ? 'cursor-grabbing z-10' : 'cursor-grab'}`}
      style={{
        width: size,
        height: size,
        left: 0,
        top: 0,
        '--drag-rotation': `${currentRotationRef.current}deg`,
        transform: `translate3d(${x - size / 2}px, ${y - size / 2}px, 0) scale(${isDragging ? 1.08 : 1}) rotate(var(--drag-rotation, 0deg))`,
        opacity,
        transition: 'box-shadow 0.3s ease',
        touchAction: 'none',
        willChange: 'transform',
      } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className={`w-full h-full rounded-3xl flex flex-col overflow-hidden relative ${
          isDeleteMode ? 'border-2 border-destructive' : 'border border-[hsla(275,60%,55%,0.2)]'
        }`}
        style={{
          backgroundColor: 'hsl(45, 12%, 96%)',
          boxShadow: getCardShadow(),
        }}
      >
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, hsla(275, 60%, 55%, 0.08) 0%, transparent 50%, hsla(330, 65%, 55%, 0.06) 100%)',
          }}
        />

        <div className="flex items-center gap-2 p-2.5 pb-2 relative z-10">
          <PlanetAvatar planet={post.authorPlanet} size={28} />
          <span className="text-[11px] font-semibold text-[hsl(25,18%,15%)] truncate">
            {post.authorName || t('expanded.anonymous')}
          </span>
        </div>

        {post.media && (
          <div className="flex-shrink-0 relative px-2 pb-2 z-10">
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                boxShadow: '0 0 24px hsla(275, 60%, 55%, 0.2), 0 0 48px hsla(330, 65%, 55%, 0.12), 0 8px 32px hsla(225, 45%, 40%, 0.1)',
              }}
            >
              {post.mediaType === 'video' ? (
                <>
                  <video
                    src={post.media}
                    className="w-full object-cover"
                    style={{ aspectRatio: '4/3' }}
                    preload="metadata"
                    playsInline
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={post.media}
                  alt=""
                  className="w-full object-cover"
                  style={{ aspectRatio: '4/3' }}
                  draggable={false}
                />
              )}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 px-2.5 pb-2 flex items-center justify-center relative z-10">
          <p className="text-[10px] leading-relaxed text-[hsl(25,14%,50%)] line-clamp-4 text-center">
            {post.content}
          </p>
        </div>

        <div className="flex items-center gap-1 px-2.5 pb-2.5 pt-1 relative z-10">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-full transition-colors"
            style={{ backgroundColor: isLiked ? 'hsla(330, 65%, 55%, 0.15)' : 'transparent' }}
            aria-label="like"
          >
            <svg
              className="w-4 h-4"
              style={{ fill: isLiked ? '#ec4899' : 'none', stroke: '#ec4899' }}
              strokeWidth={1.75}
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.button>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              handleShare(post);
            }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-full hover:bg-[hsl(40,12%,90%)] transition-colors"
            aria-label="share"
          >
            <svg
              className="w-4 h-4"
              style={{ stroke: 'hsl(25, 14%, 50%)' }}
              fill="none"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
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
            className="absolute -top-2 -right-2 w-8 h-8 bg-[hsl(5,65%,48%)] text-white rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-colors z-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>

      {isDragging && (
        <div
          className="absolute -inset-1 rounded-3xl pointer-events-none animate-pulse"
          style={{ border: '1px solid hsla(275, 60%, 55%, 0.3)' }}
        />
      )}

      {isDragging && nearEdgeRef.current && (
        <>
          {nearEdgeRef.current === 'left' && (
            <div className="fixed inset-y-0 left-0 w-20 pointer-events-none z-20"
              style={{ background: 'linear-gradient(to right, hsla(5, 65%, 48%, 0.35), transparent 70%)' }} />
          )}
          {nearEdgeRef.current === 'right' && (
            <div className="fixed inset-y-0 right-0 w-20 pointer-events-none z-20"
              style={{ background: 'linear-gradient(to left, hsla(5, 65%, 48%, 0.35), transparent 70%)' }} />
          )}
          {nearEdgeRef.current === 'top' && (
            <div className="fixed inset-x-0 top-0 h-20 pointer-events-none z-20"
              style={{ background: 'linear-gradient(to bottom, hsla(5, 65%, 48%, 0.35), transparent 70%)' }} />
          )}
          {nearEdgeRef.current === 'bottom' && (
            <div className="fixed inset-x-0 bottom-0 h-20 pointer-events-none z-20"
              style={{ background: 'linear-gradient(to top, hsla(5, 65%, 48%, 0.35), transparent 70%)' }} />
          )}
        </>
      )}
    </div>
  );
}
