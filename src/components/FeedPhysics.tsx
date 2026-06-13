import { useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/hooks/AppProvider';
import { positionStore } from '@/stores/positionStore';
import { useDeviceSize, getCardCountForBreakpoint, getDynamicCardSize } from '@/hooks/useDeviceSize';

// 헤더 높이: h-14(56px) / sm:h-[64px](64px) + safe-area-top + 여유
const TOP_OFFSET = 72;
const MAX_VELOCITY = 3; // 관성 최대 속도 (px/frame)
const FRICTION = 0.992; // 관성 마찰 계수
const DRIFT_SPEED = 0.35; // 둥둥 떠다니는 기본 속도
const DRIFT_THRESHOLD = 0.01; // 이 이하로 느려지면 방향 전환

interface FloatingNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  targetOpacity: number;
}

export function FeedPhysics() {
  const { state } = useApp();
  const { breakpoint, width } = useDeviceSize();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<FloatingNode[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const initializedRef = useRef(false);

  const isDarkMode = state.theme === 'black';
  const isDarkModeRef = useRef(isDarkMode);
  const postsRef = useRef(state.posts);

  useEffect(() => { isDarkModeRef.current = isDarkMode; }, [isDarkMode]);
  useEffect(() => { postsRef.current = state.posts; }, [state.posts]);

  useEffect(() => {
    if (state.posts.length === 0) {
      initializedRef.current = false;
      nodesRef.current = [];
    }
  }, [state.posts]);

  const getCardCount = useCallback((zoomLevel: number): number => {
    return getCardCountForBreakpoint(breakpoint, zoomLevel);
  }, [breakpoint]);

  const getCardSize = useCallback((zoomLevel: number): number => {
    return getDynamicCardSize(width, zoomLevel);
  }, [width]);

  // 카드가 머물 수 있는 경계 (헤더 아래 ~ 화면 끝)
  const getBounds = useCallback((canvas: HTMLCanvasElement, nodeSize: number) => ({
    minX: nodeSize / 2,
    maxX: canvas.width - nodeSize / 2,
    minY: TOP_OFFSET + nodeSize / 2,
    maxY: canvas.height - nodeSize / 2,
  }), []);

  const clampPosition = (node: FloatingNode, canvas: HTMLCanvasElement) => {
    const b = getBounds(canvas, node.size);
    node.x = Math.max(b.minX, Math.min(b.maxX, node.x));
    node.y = Math.max(b.minY, Math.min(b.maxY, node.y));
  };

  const initNodes = useCallback((canvas: HTMLCanvasElement) => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const maxCards = getCardCount(state.zoomLevel);
    const posts = state.posts.slice(0, maxCards);
    const baseSize = getCardSize(state.zoomLevel);

    nodesRef.current = posts.map((post) => {
      const size = baseSize + Math.random() * 20;
      const b = getBounds(canvas, size);
      return {
        id: post.id,
        x: b.minX + Math.random() * (b.maxX - b.minX),
        y: b.minY + Math.random() * (b.maxY - b.minY),
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size,
        opacity: 0,
        targetOpacity: 1,
      };
    });
  }, [state.posts, state.zoomLevel, getCardCount, getCardSize, getBounds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const handleResize = () => {
      resizeCanvas();
      nodesRef.current.forEach(node => clampPosition(node, canvas));
    };
    window.addEventListener('resize', handleResize);

    initNodes(canvas);

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 배경만 그림 — 카드 시각은 HTML PostCard가 담당
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDarkModeRef.current ? 'hsl(20, 15%, 5%)' : 'hsl(60, 20%, 97%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodesRef.current.forEach((node) => {
        const isDragged = node.id === positionStore.getDraggingId();

        if (isDragged) {
          // 드래그 중: PostCard가 위치를 직접 제어 → 동기화만
          const pos = positionStore.getSnapshot().find(p => p.id === node.id);
          if (pos) {
            node.x = pos.x;
            node.y = pos.y;
          }
          node.vx = 0;
          node.vy = 0;
        } else {
          // 드래그 놓은 직후 관성 속도 적용
          const releasedVelocity = positionStore.consumeDragVelocity(node.id);
          if (releasedVelocity) {
            // 속도 캡
            node.vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, releasedVelocity.vx));
            node.vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, releasedVelocity.vy));
          }

          node.x += node.vx;
          node.y += node.vy;

          // 경계 바운스 (헤더 아래 ~ 화면 끝)
          const b = getBounds(canvas, node.size);
          if (node.x < b.minX || node.x > b.maxX) {
            node.vx *= -0.5;
            node.x = Math.max(b.minX, Math.min(b.maxX, node.x));
          }
          if (node.y < b.minY || node.y > b.maxY) {
            node.vy *= -0.5;
            node.y = Math.max(b.minY, Math.min(b.maxY, node.y));
          }

          // 관성 마찰
          node.vx *= FRICTION;
          node.vy *= FRICTION;

          // 거의 멈추면 둥둥 떠다니기
          if (Math.abs(node.vx) < DRIFT_THRESHOLD && Math.abs(node.vy) < DRIFT_THRESHOLD) {
            node.vx = (Math.random() - 0.5) * DRIFT_SPEED;
            node.vy = (Math.random() - 0.5) * DRIFT_SPEED;
          }
        }

        // opacity 페이드인/아웃
        node.opacity += (node.targetOpacity - node.opacity) * 0.05;
      });

      // positionStore 업데이트 → FeedCards(PostCard)가 위치 동기화
      positionStore.updatePositions(
        nodesRef.current.map((node) => ({
          id: node.id,
          x: node.x,
          y: node.y,
          size: node.size,
          opacity: node.opacity,
          isDragging: node.id === positionStore.getDraggingId(),
        }))
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [initNodes, getBounds]);

  // 줌/포스트 변경 시 노드 추가/제거
  useEffect(() => {
    if (!canvasRef.current || state.posts.length === 0) return;

    const canvas = canvasRef.current;
    const maxCards = getCardCount(state.zoomLevel);
    const posts = state.posts.slice(0, maxCards);

    const existingIds = new Set(nodesRef.current.map(n => n.id));
    const postsToAdd = posts.filter(p => !existingIds.has(p.id));

    postsToAdd.forEach((post) => {
      const baseSize = getCardSize(state.zoomLevel);
      const size = baseSize + Math.random() * 20;
      const b = getBounds(canvas, size);
      nodesRef.current.push({
        id: post.id,
        x: b.minX + Math.random() * (b.maxX - b.minX),
        y: b.minY + Math.random() * (b.maxY - b.minY),
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size,
        opacity: 0,
        targetOpacity: 1,
      });
    });

    nodesRef.current.forEach((node) => {
      node.targetOpacity = posts.some(p => p.id === node.id) ? 1 : 0;
    });

    nodesRef.current = nodesRef.current.filter(node => node.opacity > 0.01 || node.targetOpacity > 0);
  }, [state.zoomLevel, state.posts, getCardCount, getCardSize, getBounds]);

  return (
    <div className="fixed inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
