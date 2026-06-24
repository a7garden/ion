import { motion, AnimatePresence } from 'framer-motion';
import type { Post } from '@/types';
import { PlanetAvatar } from '@/components/PlanetAvatar';
import { useI18n } from '@/i18n';

interface ExpandedCardProps {
  open: boolean;
  onClose: () => void;
  post: Post | null;
  isLiked: boolean;
  onToggleLike: () => void;
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

export function ExpandedCard({
  open,
  onClose,
  post,
  isLiked,
  onToggleLike,
}: ExpandedCardProps) {
  const { t } = useI18n();
  if (!post) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 backdrop-blur-sm"
            style={{ backgroundColor: 'hsla(25, 18%, 15%, 0.15)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ paddingBottom: 'var(--safe-area-bottom)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl overflow-hidden relative"
              style={{
                backgroundColor: 'hsl(45, 12%, 96%)',
                boxShadow: '0 8px 40px hsla(225, 45%, 40%, 0.2), 0 0 60px hsla(275, 60%, 55%, 0.12), 0 0 80px hsla(330, 65%, 55%, 0.08)',
              }}
              layoutId={`card-${post.id}`}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 28,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg, hsla(275, 60%, 55%, 0.06) 0%, transparent 50%, hsla(330, 65%, 55%, 0.04) 100%)' }}
              />

              <div className="w-full h-full flex flex-col p-5 relative max-h-[85vh]">
                <motion.button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 z-10 touch-target"
                  style={{ backgroundColor: 'transparent' }}
                  whileHover={{ backgroundColor: 'hsla(275, 60%, 55%, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ stroke: 'hsl(25, 14%, 50%)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>

                <div className="flex items-center gap-3 mb-5">
                  <PlanetAvatar planet={post.authorPlanet} size={44} showGlow />
                  <div className="min-w-0">
                    <h2 className="text-[16px] font-semibold truncate leading-tight" style={{ color: 'hsl(25, 18%, 15%)' }}>
                      {post.authorName || t('expanded.anonymous')}
                    </h2>
                    <p className="text-xs" style={{ color: 'hsl(25, 14%, 50%)' }}>· 2m</p>
                  </div>
                </div>

                {post.media && (
                  <motion.div
                    className="mb-5 flex-shrink-0 relative rounded-2xl overflow-hidden"
                    style={{
                      boxShadow: '0 4px 24px hsla(225, 45%, 40%, 0.15), 0 0 40px hsla(275, 60%, 55%, 0.1)',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {post.mediaType === 'video' ? (
                      <video
                        src={post.media}
                        className="w-full object-cover"
                        style={{ maxHeight: '50vw' }}
                        controls
                        muted={false}
                      />
                    ) : (
                      <img
                        src={post.media}
                        alt=""
                        className="w-full object-cover"
                        style={{ maxHeight: '50vw' }}
                        draggable={false}
                      />
                    )}
                    <div
                      className="absolute inset-0 pointer-events-none rounded-2xl"
                      style={{ background: 'linear-gradient(to top, hsla(0,0%,0%,0.1), transparent)' }}
                    />
                  </motion.div>
                )}

                <motion.div
                  className="flex-1 min-h-0 overflow-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <p className="text-[15px] leading-[1.6] whitespace-pre-wrap select-text" style={{ color: 'hsla(25, 18%, 15%, 0.9)' }}>
                    {post.content}
                  </p>
                </motion.div>

                <motion.div
                  className="flex items-center gap-2 pt-4 mt-4 border-t"
                  style={{ borderColor: 'hsla(40, 10%, 87%, 0.3)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike();
                    }}
                    className="relative p-2.5 rounded-full transition-colors duration-200 touch-target"
                    style={{ backgroundColor: isLiked ? 'hsla(330, 65%, 55%, 0.12)' : 'transparent' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.svg
                      className="w-6 h-6"
                      style={{
                        fill: isLiked ? '#ec4899' : 'none',
                        stroke: isLiked ? '#ec4899' : 'hsl(25, 14%, 50%)',
                      }}
                      viewBox="0 0 24 24"
                      animate={isLiked ? {
                        scale: [1, 1.2, 1],
                      } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </motion.svg>
                    {isLiked && (
                      <motion.div
                        className="absolute inset-0 rounded-full blur-md"
                        style={{ backgroundColor: 'hsla(330, 65%, 55%, 0.2)' }}
                        initial={{ opacity: 0.4 }}
                        animate={{ opacity: [0.4, 0.15, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.button>

                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(post);
                    }}
                    className="p-2.5 rounded-full transition-colors duration-200 touch-target"
                    style={{ backgroundColor: 'transparent' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg
                      className="w-5 h-5"
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
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
