import { useEffect, useRef, useCallback } from 'react';
import { positionStore } from '@/stores/positionStore';
import { useClient } from '@/hooks/ClientProvider';
import { useDeviceSize, getCardCountForBreakpoint, getDynamicCardSize } from '@/hooks/useDeviceSize';
import type { Post } from '@/types';

const TOP_OFFSET = 72;
const MAX_VELOCITY = 3;
const FRICTION = 0.992;
const DRIFT_SPEED = 0.35;
const DRIFT_THRESHOLD = 0.01;

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

interface FeedPhysicsProps {
  posts: Post[];
}

export function FeedPhysics({ posts }: FeedPhysicsProps) {
  const { theme, zoomLevel } = useClient();
  const { breakpoint, width } = useDeviceSize();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<FloatingNode[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const initializedRef = useRef(false);

  const isDarkMode = theme === 'black';
  const isDarkModeRef = useRef(isDarkMode);
  const postsRef = useRef(posts);

  useEffect(() => { isDarkModeRef.current = isDarkMode; }, [isDarkMode]);
  useEffect(() => { postsRef.current = posts; }, [posts]);

  useEffect(() => {
    if (posts.length === 0) {
      initializedRef.current = false;
      nodesRef.current = [];
    }
  }, [posts]);

  const getCardCount = useCallback((zl: number): number => {
    return getCardCountForBreakpoint(breakpoint, zl);
  }, [breakpoint]);

  const getCardSize = useCallback((zl: number): number => {
    return getDynamicCardSize(width, zl);
  }, [width]);

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

    const maxCards = getCardCount(zoomLevel);
    const slicedPosts = posts.slice(0, maxCards);
    const baseSize = getCardSize(zoomLevel);

    nodesRef.current = slicedPosts.map((post) => {
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
  }, [posts, zoomLevel, getCardCount, getCardSize, getBounds]);

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

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDarkModeRef.current ? 'hsl(20, 15%, 5%)' : 'hsl(60, 20%, 97%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodesRef.current.forEach((node) => {
        const isDragged = node.id === positionStore.getDraggingId();

        if (isDragged) {
          const pos = positionStore.getSnapshot().find(p => p.id === node.id);
          if (pos) {
            node.x = pos.x;
            node.y = pos.y;
          }
          node.vx = 0;
          node.vy = 0;
        } else {
          const releasedVelocity = positionStore.consumeDragVelocity(node.id);
          if (releasedVelocity) {
            node.vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, releasedVelocity.vx));
            node.vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, releasedVelocity.vy));
          }

          node.x += node.vx;
          node.y += node.vy;

          const b = getBounds(canvas, node.size);
          if (node.x < b.minX || node.x > b.maxX) {
            node.vx *= -0.5;
            node.x = Math.max(b.minX, Math.min(b.maxX, node.x));
          }
          if (node.y < b.minY || node.y > b.maxY) {
            node.vy *= -0.5;
            node.y = Math.max(b.minY, Math.min(b.maxY, node.y));
          }

          node.vx *= FRICTION;
          node.vy *= FRICTION;

          if (Math.abs(node.vx) < DRIFT_THRESHOLD && Math.abs(node.vy) < DRIFT_THRESHOLD) {
            node.vx = (Math.random() - 0.5) * DRIFT_SPEED;
            node.vy = (Math.random() - 0.5) * DRIFT_SPEED;
          }
        }

        node.opacity += (node.targetOpacity - node.opacity) * 0.05;
      });

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

  useEffect(() => {
    if (!canvasRef.current || posts.length === 0) return;

    const canvas = canvasRef.current;
    const maxCards = getCardCount(zoomLevel);
    const slicedPosts = posts.slice(0, maxCards);
    const baseSize = getCardSize(zoomLevel);

    nodesRef.current.forEach((node) => {
      const newSize = baseSize + (node.size % 20);
      node.size = newSize;
    });

    const existingIds = new Set(nodesRef.current.map(n => n.id));
    const postsToAdd = slicedPosts.filter(p => !existingIds.has(p.id));

    postsToAdd.forEach((post) => {
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
      node.targetOpacity = slicedPosts.some(p => p.id === node.id) ? 1 : 0;
      clampPosition(node, canvas);
    });

    nodesRef.current = nodesRef.current.filter(node => node.opacity > 0.01 || node.targetOpacity > 0);
  }, [zoomLevel, posts, getCardCount, getCardSize, getBounds]);

  return (
    <div className="fixed inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
