import { motion } from 'framer-motion';
import type { Post } from '@/types';
import { PlanetAvatar } from '@/components/PlanetAvatar';
import { useI18n } from '@/i18n';

interface MobileFeedCardProps {
  post: Post;
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

export function MobileFeedCard({ post, isLiked, onToggleLike }: MobileFeedCardProps) {
  const { t } = useI18n();

  return (
    <div
      className="relative w-full h-full flex flex-col select-none"
      style={{
        paddingTop: 'calc(var(--safe-area-top) + 88px)',
        paddingBottom: 'calc(var(--safe-area-bottom) + 24px)',
        paddingLeft: 'max(16px, var(--safe-area-left))',
        paddingRight: 'max(16px, var(--safe-area-right))',
      }}
    >
      <div className="mx-auto w-full max-w-[420px] flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <PlanetAvatar planet={post.authorPlanet} size={42} showGlow />
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-[hsl(25,18%,15%)] truncate leading-tight">
              {post.authorName || t('expanded.anonymous')}
            </h2>
            <p className="text-xs text-[hsl(25,14%,50%)]">· 2m</p>
          </div>
        </div>

        {post.media && (
          <div className="mb-4 flex-shrink-0">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 0 24px hsla(275, 60%, 55%, 0.2), 0 0 48px hsla(330, 65%, 55%, 0.15), 0 8px 32px hsla(225, 45%, 40%, 0.1)',
              }}
            >
              {post.mediaType === 'video' ? (
                <>
                  <video
                    src={post.media}
                    className="w-full object-cover"
                    style={{ aspectRatio: '4/5' }}
                    preload="metadata"
                    playsInline
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
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
                  style={{ aspectRatio: '4/5' }}
                  draggable={false}
                />
              )}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to top, hsla(0,0%,0%,0.15) 0%, transparent 40%)' }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 mb-4">
          <p className="text-[15px] leading-[1.55] text-[hsl(25,18%,15%)] whitespace-pre-wrap opacity-90">
            {post.content}
          </p>
        </div>

        <div
          className="flex items-center gap-1 pt-3 border-t"
          style={{ borderColor: 'hsla(40, 10%, 87%, 0.3)' }}
        >
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2.5 rounded-full transition-colors touch-target"
            style={{ backgroundColor: isLiked ? 'hsla(330, 65%, 55%, 0.15)' : 'transparent' }}
            aria-label="like"
          >
            <motion.svg
              className="w-6 h-6"
              style={{
                fill: isLiked ? '#ec4899' : 'none',
                stroke: isLiked ? '#ec4899' : 'hsl(25, 14%, 50%)',
              }}
              viewBox="0 0 24 24"
              animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </motion.svg>
          </motion.button>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              handleShare(post);
            }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-full transition-colors touch-target"
            style={{ backgroundColor: 'transparent' }}
            aria-label="share"
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
        </div>
      </div>
    </div>
  );
}
