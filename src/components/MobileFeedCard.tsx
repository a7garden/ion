import { motion } from 'framer-motion';
import type { Post } from '@/types';
import { PlanetAvatar } from '@/components/PlanetAvatar';
import { useI18n } from '@/i18n';

interface MobileFeedCardProps {
  post: Post;
  isLiked: boolean;
  onToggleLike: () => void;
}

/**
 * 모바일 전용 풀스크린 피드 카드.
 * 한 장이 화면을 가득 채우며, 제스처(세로 넘기기 / 왼쪽 제외)는
 * 상위 SwipeFeedView가 처리한다. 여기서는 내용 표현만 담당.
 */
export function MobileFeedCard({ post, isLiked, onToggleLike }: MobileFeedCardProps) {
  const { t } = useI18n();

  return (
    <div
      className="relative w-full h-full flex flex-col select-none"
      style={{
        paddingTop: 'calc(var(--safe-area-top) + 100px)',
        paddingBottom: 'calc(var(--safe-area-bottom) + 28px)',
        paddingLeft: 'max(22px, var(--safe-area-left))',
        paddingRight: 'max(22px, var(--safe-area-right))',
      }}
    >
      {/* 작성자 */}
      <div className="flex items-center gap-3 mb-4">
        <PlanetAvatar planet={post.authorPlanet} size={46} showGlow />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground truncate leading-tight">
            {post.authorName || t('expanded.anonymous')}
          </h2>
          <p className="text-xs text-muted-foreground">{t('expanded.postedRecently')}</p>
        </div>
      </div>

      {/* 미디어 */}
      {post.media && (
        <div className="mb-4 flex-shrink-0 flex justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-border/40 shadow-ds-md bg-black/5">
            {post.mediaType === 'video' ? (
              <>
                <video
                  src={post.media}
                  className="block object-contain"
                  style={{ maxHeight: '42vh', maxWidth: '78vw' }}
                  preload="metadata"
                  playsInline
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/15 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <img
                src={post.media}
                alt=""
                className="block object-contain"
                style={{ maxHeight: '42vh', maxWidth: '78vw' }}
                draggable={false}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card/30 to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      {/* 본문 — 한 화면에 들어가도록 클램프. 길면 탭하여 확장 */}
      <div className="flex-1 min-h-0">
        <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap line-clamp-[10]">
          {post.content}
        </p>
      </div>

      {/* 좋아요 — 수치 없이 하트 토글만 */}
      <div className="flex items-center justify-center pt-4 mt-2 border-t border-border/40">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike();
          }}
          whileTap={{ scale: 0.82 }}
          className="relative p-3 rounded-full hover:bg-accent/10 transition-colors touch-target"
          aria-label="like"
        >
          <motion.svg
            className={`w-7 h-7 transition-colors duration-300 ${
              isLiked ? 'fill-destructive stroke-destructive' : 'fill-none stroke-muted-foreground'
            }`}
            viewBox="0 0 24 24"
            animate={isLiked ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </motion.svg>
        </motion.button>
      </div>
    </div>
  );
}
