import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '@/hooks/AppProvider';
import { positionStore } from '@/stores/positionStore';
import { useDeviceSize, getCardCountForBreakpoint, getDynamicCardSize } from '@/hooks/useDeviceSize';
import type { Post } from '@/types';

interface FloatingNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  authorId: string;
  content: string;
  media?: string;
  targetOpacity: number;
}

interface CardPosition {
  x: number;
  y: number;
  size: number;
}

interface FeedPhysicsProps {
  onCardClick: (post: Post, cardRect: CardPosition) => void;
  onDelete: (postId: string) => void;
}

export function FeedPhysics({ onCardClick, onDelete }: FeedPhysicsProps) {
  const { state, deletePost } = useApp();
  const { breakpoint, width } = useDeviceSize();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<FloatingNode[]>([]);
  const draggingNodeIdRef = useRef<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<FloatingNode | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | undefined>(undefined);
  const initializedRef = useRef(false);

  const isDarkMode = state.theme === 'black';

  const getCardCount = useCallback((zoomLevel: number): number => {
    return getCardCountForBreakpoint(breakpoint, zoomLevel);
  }, [breakpoint]);

  const getCardSize = useCallback((zoomLevel: number): number => {
    return getDynamicCardSize(width, zoomLevel);
  }, [width]);

  const initNodes = useCallback((canvas: HTMLCanvasElement) => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const maxCards = getCardCount(state.zoomLevel);
    const posts = state.posts.slice(0, maxCards);
    const baseSize = getCardSize(state.zoomLevel);

    nodesRef.current = posts.map((post) => {
      const size = baseSize + Math.random() * 20;
      const padding = size;
      return {
        id: post.id,
        x: padding + Math.random() * (canvas.width - padding * 2),
        y: padding + Math.random() * (canvas.height - padding * 2),
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size,
        opacity: 0,
        targetOpacity: 1,
        authorId: post.authorId,
        content: post.content,
        media: post.media,
      };
    });
  }, [state.posts, state.zoomLevel, getCardCount, getCardSize]);

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

      nodesRef.current.forEach(node => {
        node.x = Math.max(node.size / 2, Math.min(canvas.width - node.size / 2, node.x));
        node.y = Math.max(node.size / 2, Math.min(canvas.height - node.size / 2, node.y));
      });
    };
    window.addEventListener('resize', handleResize);

    initNodes(canvas);

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDarkMode ? 'hsl(20, 15%, 5%)' : 'hsl(60, 20%, 97%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const colors = isDarkMode ? {
        fill: 'hsl(20, 12%, 9%)',
        stroke: 'hsl(20, 8%, 20%)',
        selectedFill: 'hsl(38, 75%, 60% / 0.25)',
        selectedStroke: 'hsl(38, 75%, 60% / 0.8)',
        shadow: 'rgba(0, 0, 0, 0.4)',
      } : {
        fill: 'hsl(40, 15%, 96%)',
        stroke: 'hsl(30, 10%, 85%)',
        selectedFill: 'hsl(38, 70%, 55% / 0.18)',
        selectedStroke: 'hsl(38, 70%, 55%)',
        shadow: 'rgba(0, 0, 0, 0.08)',
      };

      const isDraggingAny = draggingNodeIdRef.current !== null || positionStore.getDraggingId() !== null;

      nodesRef.current.forEach((node) => {
        const isDragged = node.id === draggingNodeIdRef.current || node.id === positionStore.getDraggingId();

        if (isDraggingAny) {
          if (isDragged) {
            node.vx = 0;
            node.vy = 0;
          } else {
            node.x += node.vx;
            node.y += node.vy;

            if (node.x < node.size / 2 || node.x > canvas.width - node.size / 2) {
              node.vx *= -1;
              node.x = Math.max(node.size / 2, Math.min(canvas.width - node.size / 2, node.x));
            }
            if (node.y < node.size / 2 || node.y > canvas.height - node.size / 2) {
              node.vy *= -1;
              node.y = Math.max(node.size / 2, Math.min(canvas.height - node.size / 2, node.y));
            }

            if (Math.abs(node.vx) < 0.08 && Math.abs(node.vy) < 0.08) {
              node.vx = (Math.random() - 0.5) * 0.2;
              node.vy = (Math.random() - 0.5) * 0.2;
            }
          }
        } else {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < node.size / 2 || node.x > canvas.width - node.size / 2) {
            node.vx *= -1;
            node.x = Math.max(node.size / 2, Math.min(canvas.width - node.size / 2, node.x));
          }
          if (node.y < node.size / 2 || node.y > canvas.height - node.size / 2) {
            node.vy *= -1;
            node.y = Math.max(node.size / 2, Math.min(canvas.height - node.size / 2, node.y));
          }

          if (Math.abs(node.vx) < 0.08 && Math.abs(node.vy) < 0.08) {
            node.vx = (Math.random() - 0.5) * 0.2;
            node.vy = (Math.random() - 0.5) * 0.2;
          }
        }

        node.opacity += (node.targetOpacity - node.opacity) * 0.05;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, node.opacity));

        const isSelected = selectedNode?.id === node.id;
        const radius = node.size / 2;

        ctx.shadowColor = colors.shadow;
        ctx.shadowBlur = isSelected ? 18 : 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = isSelected ? colors.selectedFill : colors.fill;
        ctx.strokeStyle = isSelected ? colors.selectedStroke : colors.stroke;
        ctx.lineWidth = isSelected ? 2 : 1;

        ctx.beginPath();
        ctx.roundRect(node.x - radius, node.y - radius, node.size, node.size, 12);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = colors.selectedStroke;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.stroke();
        }

        ctx.restore();
      });

      positionStore.updatePositions(
        nodesRef.current.map((node) => ({
          id: node.id,
          x: node.x,
          y: node.y,
          size: node.size,
          opacity: node.opacity,
          isDragging: node.id === draggingNodeIdRef.current,
        }))
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.userLikes, state.currentUser, selectedNode, isDarkMode, initNodes]);

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
      const padding = size;
      nodesRef.current.push({
        id: post.id,
        x: padding + Math.random() * (canvas.width - padding * 2),
        y: padding + Math.random() * (canvas.height - padding * 2),
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size,
        opacity: 0,
        targetOpacity: 1,
        authorId: post.authorId,
        content: post.content,
        media: post.media,
      });
    });

    nodesRef.current.forEach((node) => {
      const shouldExist = posts.some(p => p.id === node.id);
      if (shouldExist) {
        node.targetOpacity = 1;
      } else {
        node.targetOpacity = 0;
      }
    });

    nodesRef.current = nodesRef.current.filter(node => node.opacity > 0.01 || node.targetOpacity > 0);
  }, [state.zoomLevel, state.posts, getCardCount, getCardSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedNode = nodesRef.current.find((node) => {
        const dx = x - node.x;
        const dy = y - node.y;
        return Math.sqrt(dx * dx + dy * dy) < node.size / 2;
      });

      if (clickedNode) {
        draggingNodeIdRef.current = clickedNode.id;
        setSelectedNode(clickedNode);
        dragOffset.current = { x: x - clickedNode.x, y: y - clickedNode.y };
        positionStore.setDragging(clickedNode.id);
        canvas.setPointerCapture(e.pointerId);

        setTimeout(() => {
          if (draggingNodeIdRef.current === clickedNode.id) {
            positionStore.setDeleteMode(clickedNode.id);
          }
        }, 500);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingNodeIdRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const node = nodesRef.current.find((n) => n.id === draggingNodeIdRef.current);
      if (node) {
        node.x = x - dragOffset.current.x;
        node.y = y - dragOffset.current.y;
        node.vx = 0;
        node.vy = 0;
        positionStore.updateSinglePosition(node.id, node.x, node.y);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!draggingNodeIdRef.current) return;

      const node = nodesRef.current.find((n) => n.id === draggingNodeIdRef.current);
      const deleteModeId = positionStore.getDeleteModeId();

      if (node && deleteModeId === node.id) {
        draggingNodeIdRef.current = null;
        positionStore.setDragging(null);
        canvas.releasePointerCapture(e.pointerId);
        return;
      }

      if (node) {
        node.vx = (Math.random() - 0.5) * 0.4;
        node.vy = (Math.random() - 0.5) * 0.4;
      }

      draggingNodeIdRef.current = null;
      positionStore.setDragging(null);
      canvas.releasePointerCapture(e.pointerId);
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const deleteModeId = positionStore.getDeleteModeId();
      if (deleteModeId) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedNode = nodesRef.current.find((node) => {
        const dx = x - node.x;
        const dy = y - node.y;
        return Math.sqrt(dx * dx + dy * dy) < node.size / 2;
      });

      if (clickedNode && draggingNodeIdRef.current !== clickedNode.id) {
        const post = state.posts.find((p) => p.id === clickedNode.id);
        if (post) {
          onCardClick(post, { x: clickedNode.x, y: clickedNode.y, size: clickedNode.size });
        }
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('dblclick', handleDoubleClick);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [selectedNode, deletePost, onCardClick, onDelete]);

  return (
    <div className="fixed inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
