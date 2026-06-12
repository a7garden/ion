import { motion } from 'framer-motion';
import type { Post } from '@/types';

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
}: PostCardProps) {
  return (
    <div
      className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
      style={{
        width: size,
        height: size,
        left: 0,
        top: 0,
        transform: `translate3d(${x - size / 2}px, ${y - size / 2}px, 0) ${isDragging ? 'scale(1.1) rotate(3deg)' : 'scale(1) rotate(0deg)'}`,
        opacity,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out, box-shadow 0.3s ease',
        touchAction: 'none',
      }}
      onClick={onClick}
    >
      <motion.div
        layoutId={`card-${post.id}`}
        className={`w-full h-full bg-card rounded-2xl p-4 flex flex-col overflow-hidden transition-all duration-300 ${
          isDeleteMode ? 'border-2 border-destructive' : 'border border-border/50'
        }`}
        whileHover={{ y: -4 }}
        style={{
          boxShadow: isDeleteMode
            ? '0 0 30px hsl(var(--destructive) / 0.4)'
            : isDragging
            ? '0 16px 48px hsl(var(--warm-shadow) / 0.25), 0 0 20px hsl(var(--gold-glow) / 0.15)'
            : '0 4px 20px hsl(var(--warm-shadow) / 0.08), 0 1px 3px hsl(var(--foreground) / 0.05)',
        }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {post.media && (
          <div className="mb-3 flex-shrink-0 relative">
            <div className="relative overflow-hidden rounded-xl">
              {post.media.includes('video') || post.media.startsWith('data:video') ? (
                <div className="relative">
                  <video
                    src={post.media}
                    className="w-full h-20 object-cover transition-transform duration-300 hover:scale-105"
                    poster={post.thumbnail}
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
                  className="w-full h-20 object-cover transition-transform duration-300 hover:scale-105"
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
        <div className="absolute -inset-1 rounded-2xl border-2 border-accent/40 blur-sm pointer-events-none animate-pulse-slow" />
      )}
    </div>
  );
}