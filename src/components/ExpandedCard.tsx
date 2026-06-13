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
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-[var(--safe-area-bottom)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="w-full max-w-md bg-card rounded-2xl sm:rounded-3xl border border-border/50 shadow-ds-xl shadow-glow overflow-hidden"
              layoutId={`card-${post.id}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 28,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />

              <div className="w-full h-full flex flex-col p-4 sm:p-6 relative max-h-[85vh]">
                <motion.button
                  onClick={onClose}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 hover:bg-muted rounded-full transition-all duration-200 hover:scale-105 active:scale-95 z-10 touch-target"
                  whileHover={{ backgroundColor: 'hsl(var(--accent) / 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground"
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

                <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                  <PlanetAvatar planet={post.authorPlanet} size={40} />
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-foreground">{post.authorName || t('expanded.anonymous')}</h2>
                    <p className="text-xs text-muted-foreground">{t('expanded.postedRecently')}</p>
                  </div>
                </div>

                {post.media && (
                  <motion.div
                    className="mb-4 sm:mb-5 flex-shrink-0 relative rounded-xl sm:rounded-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {post.mediaType === 'video' ? (
                      <video
                        src={post.media}
                        className="w-full max-h-[50vw] sm:max-h-72 object-contain bg-black/5 rounded-lg"
                        controls
                        muted={false}
                      />
                    ) : (
                      <img
                        src={post.media}
                        alt="Post media"
                        className="w-full max-h-[50vw] sm:max-h-72 object-contain rounded-lg"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent pointer-events-none" />
                  </motion.div>
                )}

                <motion.div
                  className="flex-1 overflow-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </motion.div>

                <motion.div
                  className="flex items-center justify-center pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-border/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike();
                    }}
                    className="relative p-2.5 sm:p-3 rounded-full hover:bg-accent/10 transition-colors duration-200 touch-target"
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.svg
                      className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${
                        isLiked
                          ? 'fill-destructive stroke-destructive'
                          : 'fill-none stroke-muted-foreground hover:stroke-accent'
                      }`}
                      viewBox="0 0 24 24"
                      animate={isLiked ? {
                        scale: [1, 1.2, 1],
                        filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
                      } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </motion.svg>
                    {isLiked && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-destructive/20 blur-md"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
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