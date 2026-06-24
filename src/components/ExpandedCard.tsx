import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Post } from '@/types';
import { CollageOverlay } from '@/components/CollageOverlay';

interface ExpandedCardProps {
  open: boolean;
  onClose: () => void;
  post: Post | null;
  isLiked: boolean;
  onToggleLike: () => void;
}

export function ExpandedCard({
  open,
  onClose,
  post,
  isLiked,
  onToggleLike,
}: ExpandedCardProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!post) return null;

  const onPhoto = !!post.media;
  // 사진 위: 어두운 blob. 텍스트 단독 cream: subtle hover.
  const overlayBtn =
    'absolute w-10 h-10 rounded-full flex items-center justify-center z-10';
  const overlayStyle: React.CSSProperties = onPhoto
    ? { backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }
    : {};
  const overlayClass = onPhoto
    ? overlayBtn
    : `${overlayBtn} hover:bg-foreground/5 text-muted-foreground hover:text-foreground`;
  const iconColor = onPhoto ? '#ffffff' : 'currentColor';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 cursor-default"
            style={{
              backgroundColor: 'oklch(0 0 0 / 0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            layoutId={`card-${post.id}`}
            className="relative aspect-square w-[min(90vw,82vh)] rounded-[20px] overflow-hidden"
            style={{
              backgroundColor: 'hsl(var(--surface-elevated))',
              boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {post.media ? (
              <>
                {post.mediaType === 'video' ? (
                  <video
                    src={post.media}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    playsInline
                    controls
                  />
                ) : (
                  <img
                    src={post.media}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                )}
                {post.content && (
                  <CollageOverlay
                    text={post.content}
                    color={post.textOverlay}
                    customColor={post.textColor}
                    fontSize={18}
                  />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <p className="text-[18px] leading-[1.55] text-foreground text-center whitespace-pre-wrap break-words max-w-[36ch]">
                  {post.content}
                </p>
              </div>
            )}

            {/* 닫기 — 우상단 */}
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.88 }}
              className={`${overlayClass} top-3 right-3`}
              style={overlayStyle}
              aria-label="close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke={iconColor}
                strokeWidth={2}
                strokeLinecap="round"
                viewBox="0 0 24 24"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </motion.button>

            {/* 좋아요 — 우하단 (피드 카드와 동일 위치) */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike();
              }}
              whileTap={{ scale: 0.85 }}
              className={`${overlayClass} bottom-3 right-3`}
              style={overlayStyle}
              aria-label="like"
            >
              <svg
                className="w-5 h-5"
                style={{
                  fill: isLiked ? '#ec4899' : 'none',
                  stroke: isLiked ? '#ec4899' : iconColor,
                }}
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
