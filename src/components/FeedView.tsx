import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FeedPhysics } from './FeedPhysics';
import { FeedCards } from './FeedCards';
import { MobileFeedCard } from './MobileFeedCard';
import { Button } from '@/components/ui/button';
import type { Post } from '@/types';
import { useDeviceSize } from '@/hooks/useDeviceSize';
import { useI18n } from '@/i18n';

interface FeedViewProps {
  posts: Post[];
  onCardClick: (post: Post) => void;
  onDelete: (postId: string) => void;
  onCreatePostClick: () => void;
  expandedPostId?: string | null;
  onRefetch: () => void;
  likedIds?: string[];
  onToggleLike?: (postId: string) => void;
}

/**
 * 모바일 풀스크린 피드.
 *  - 세로 스와이프(위/아래): 카드 넘기기 (다음/이전 피드)
 *  - 왼쪽 스와이프: 해당 피드 제외(dismiss)
 *  - 탭: ExpandedCard로 확장
 * 축 잠금(axis lock)으로 세로/가로 제스처가 섞이지 않는다.
 */
function SwipeFeedView({
  posts,
  onCardClick,
  onDelete,
  onCreatePostClick,
  likedIds,
  onToggleLike,
}: FeedViewProps) {
  const { t } = useI18n();
  const { width: vw, height: vh } = useDeviceSize();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [axis, setAxis] = useState<'v' | 'h' | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // 포인터 핸들러에서 동기적으로 읽기 위한 ref들
  const dragRef = useRef({ x: 0, y: 0 });
  const axisRef = useRef<'v' | 'h' | null>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const lastRef = useRef({ x: 0, y: 0, time: 0 });
  const movedRef = useRef(false);
  const velRef = useRef({ x: 0, y: 0 });
  const indexRef = useRef(0);
  const dismissTimerRef = useRef<number | undefined>(undefined);

  const currentPost = posts[currentIndex];
  indexRef.current = currentIndex;

  // dismiss 등으로 posts가 줄었을 때 인덱스 보정 +
  // dismissing 해제는 posts 갱신 이후에 (퇴장 애니메이션이 posts 변화와 충돌해 끈기지 않도록)
  useEffect(() => {
    if (currentIndex > posts.length - 1) {
      setCurrentIndex(Math.max(0, posts.length - 1));
    }
    if (dismissing) setDismissing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.length]);

  useEffect(() => () => window.clearTimeout(dismissTimerRef.current), []);

  // 왼쪽 스와이프 제외: 현재 카드가 왼쪽으로 날아가고, 다음 카드가 올라온 뒤 dismiss.
  // 다음 카드가 없는 마지막 카드는 퇴장 애니메이션을 기다리면 빈 화면이 점맧되므로
  // 즉시 dismiss하여 이전 카드가 자연스럽게 내려오게 한다.
  const beginDismiss = useCallback(() => {
    const idx = indexRef.current;
    const post = posts[idx];
    if (!post) return;
    setShowHint(false);
    window.clearTimeout(dismissTimerRef.current);

    const hasNext = idx < posts.length - 1;
    if (!hasNext) {
      // 마지막 카드: 즉시 제거 → 인덱스 보정으로 이전 카드가 transition과 함께 내려옴
      onDelete(post.id);
      setDrag({ x: 0, y: 0 });
      dragRef.current = { x: 0, y: 0 };
      return;
    }

    setDismissing(true);
    dismissTimerRef.current = window.setTimeout(() => {
      onDelete(post.id);
      setDrag({ x: 0, y: 0 });
      dragRef.current = { x: 0, y: 0 };
      // dismissing=false는 posts.length useEffect에서 (posts 갱신 보장 후)
    }, 380);
  }, [posts, onDelete]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (dismissing) return;
    const target = e.target as HTMLElement;
    // 좋아요 등 버튼 위에서는 드래그 시작 안 함
    if (target.closest('button, a')) return;

    setDragging(true);
    setAxis(null);
    axisRef.current = null;
    setDrag({ x: 0, y: 0 });
    dragRef.current = { x: 0, y: 0 };
    movedRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY };
    lastRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    velRef.current = { x: 0, y: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || dismissing) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    if (!movedRef.current && Math.hypot(dx, dy) > 8) movedRef.current = true;

    // 축 잠금: 처음 움직임 방향으로 고정
    if (!axisRef.current && movedRef.current) {
      axisRef.current = Math.abs(dy) >= Math.abs(dx) ? 'v' : 'h';
      setAxis(axisRef.current);
    }

    // 속도 추적 (릴리즈 시 관성 판정용)
    const now = performance.now();
    const dt = Math.max(1, now - lastRef.current.time);
    velRef.current = {
      x: ((e.clientX - lastRef.current.x) / dt) * 16,
      y: ((e.clientY - lastRef.current.y) / dt) * 16,
    };
    lastRef.current = { x: e.clientX, y: e.clientY, time: now };

    if (axisRef.current === 'v') {
      setDrag({ x: 0, y: dy });
      dragRef.current = { x: 0, y: dy };
    } else if (axisRef.current === 'h') {
      // 왼쪽으로만 (dx <= 0)
      const nx = Math.min(0, dx);
      setDrag({ x: nx, y: 0 });
      dragRef.current = { x: nx, y: 0 };
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }

    const a = axisRef.current;
    const d = dragRef.current;
    const v = velRef.current;

    // 탭 → 확장
    if (!movedRef.current) {
      axisRef.current = null;
      setAxis(null);
      if (currentPost) onCardClick(currentPost);
      return;
    }

    setShowHint(false);

    if (a === 'h') {
      // 왼쪽 제외
      if (d.x < -vw * 0.28 || v.x < -0.8) {
        beginDismiss();
      }
    } else if (a === 'v') {
      const goNext = d.y < -vh * 0.18 || v.y < -0.7;
      const goPrev = d.y > vh * 0.18 || v.y > 0.7;
      if (goNext && currentIndex < posts.length - 1) setCurrentIndex((i) => i + 1);
      else if (goPrev && currentIndex > 0) setCurrentIndex((i) => i - 1);
    }

    axisRef.current = null;
    setAxis(null);
    setDrag({ x: 0, y: 0 });
    dragRef.current = { x: 0, y: 0 };
  };

  // 빈 상태
  if (!currentPost) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background grain-overlay">
        <div className="text-center animate-fade-in-up px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm">{t('feed.noPosts')}</p>
          <p className="text-muted-foreground/60 text-xs mt-1">{t('feed.noPostsHint')}</p>
          <Button
            onClick={onCreatePostClick}
            className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {t('feed.createPost')}
          </Button>
        </div>
      </div>
    );
  }

  // 성능을 위해 현재 기준 앞뒤 한 장씩만 렌더
  const visibleIndices = [currentIndex - 1, currentIndex, currentIndex + 1].filter(
    (i) => i >= 0 && i < posts.length
  );

  // 각 카드의 transform 계산 (%는 카드 자기 크기 = 뷰포트 크기 기준)
  const cardStyle = (rel: number): React.CSSProperties => {
    let tx = 0;
    let ty = rel * 100;
    let rot = 0;
    let opacity = 1;
    let scale = 1;
    let z = rel === 0 ? 30 : 20;

    if (dismissing && rel === 0) {
      // 현재 카드: 왼쪽으로 퇴장
      tx = -122;
      rot = -14;
      opacity = 0;
      scale = 0.92;
      z = 40;
    } else if (dismissing && rel === 1) {
      // 다음 카드: 아래에서 올라와 자리 잡기
      ty = 0;
      z = 35;
    } else if (!dismissing && axis === 'v') {
      // 세로 드래그: 전체 칼럼이 함께 이동 (릴스 효과)
      ty = rel * 100 + (drag.y / vh) * 100;
    } else if (!dismissing && axis === 'h' && rel === 0) {
      // 가로 드래그: 현재 카드만 왼쪽으로
      const p = drag.x / vw; // <= 0
      tx = p * 100;
      rot = p * 16;
      opacity = 1 + p * 0.5;
      z = 40;
    }

    return {
      transform: `translate3d(${tx}%, ${ty}%, 0) rotate(${rot}deg) scale(${scale})`,
      opacity,
      zIndex: z,
      // 드래그 중에는 transition 끄고 손가락 추적, 그 외에는 스냅/애니메이션
      transition: dragging
        ? 'none'
        : 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease',
      willChange: 'transform, opacity',
    };
  };

  // 왼쪽 제외 인디케이터 노출 강도
  const excludeOpacity =
    axis === 'h' && drag.x < 0 ? Math.min(1, -drag.x / (vw * 0.28)) : 0;

  const progressPct = posts.length > 1 ? (currentIndex / (posts.length - 1)) * 100 : 0;

  return (
    <div className="fixed inset-0 overflow-hidden overscroll-none bg-gradient-to-b from-background via-background to-card/20 grain-overlay select-none">
      {/* 우측 세로 진행 표시 + 카운터 (헤더와 겹치지 않게 우측) */}
      <div
        className="absolute right-3 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center gap-2"
        style={{ top: '50%' }}
      >
        <span className="text-[10px] font-medium text-muted-foreground/70 tabular-nums">
          {currentIndex + 1}/{posts.length}
        </span>
        <div
          className="relative w-1 rounded-full bg-border/50"
          style={{ height: Math.min(160, vh * 0.26) }}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-accent"
            style={{ top: `calc(${progressPct}% - 5px)`, boxShadow: '0 0 10px hsl(var(--gold-glow) / 0.5)' }}
          />
        </div>
      </div>

      {/* 제스처 힌트 (첫 상호작용 전까지만, 헤더 아래) */}
      {showHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute left-0 right-0 z-50 pointer-events-none flex flex-col items-center gap-1 text-center"
          style={{ top: 'calc(var(--safe-area-top) + 64px)' }}
        >
          <span className="text-[11px] text-muted-foreground/70">{t('feed.hintUp')}</span>
          <span className="text-[11px] text-muted-foreground/70">{t('feed.hintLeft')}</span>
        </motion.div>
      )}

      {/* 스와이프 서피스 */}
      <div
        className="absolute inset-0"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {visibleIndices.map((i) => {
          const post = posts[i];
          const rel = i - currentIndex;
          return (
            <div key={post.id} className="absolute inset-0" style={cardStyle(rel)}>
              <MobileFeedCard
                post={post}
                isLiked={likedIds?.includes(post.id) ?? false}
                onToggleLike={() => onToggleLike?.(post.id)}
              />
            </div>
          );
        })}
      </div>

      {/* 왼쪽 제외 인디케이터 */}
      <div
        className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
        style={{ opacity: excludeOpacity, transition: dragging ? 'none' : 'opacity 0.2s' }}
      >
        <div
          className="absolute inset-y-0 left-0 w-28"
          style={{
            background: 'linear-gradient(to right, hsl(var(--destructive)/0.35), transparent)',
          }}
        />
        <div className="px-5 py-2.5 rounded-full bg-destructive text-destructive-foreground text-sm font-semibold shadow-ds-lg flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {t('feed.exclude')}
        </div>
      </div>
    </div>
  );
}

export function FeedView(props: FeedViewProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile =
      window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    setIsMobile(checkMobile);

    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (isMobile) {
    return <SwipeFeedView {...props} />;
  }

  // 데스크톱: 캔버스 물리 시뮬레이션 + 떠다니는 카드
  return (
    <div className="fixed inset-0 select-none">
      <FeedPhysics posts={props.posts} />
      <FeedCards
        posts={props.posts}
        onCardClick={props.onCardClick}
        onDelete={props.onDelete}
        expandedPostId={props.expandedPostId}
      />
    </div>
  );
}
