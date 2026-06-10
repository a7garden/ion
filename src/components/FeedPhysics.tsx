import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/hooks/AppProvider';
import { positionStore } from '@/stores/positionStore';

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
}

interface FeedPhysicsProps {
  onCardClick: (authorId: string, content: string) => void;
  onDelete: (postId: string) => void;
}

export function FeedPhysics({ onCardClick, onDelete }: FeedPhysicsProps) {
  const { state, deletePost } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<FloatingNode[]>([]);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<FloatingNode | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const initNodes = () => {
      const posts = state.posts.slice(0, 15);

      nodesRef.current = posts.map((post) => {
        const size = 80 + Math.random() * 60;
        const padding = size;
        return {
          id: post.id,
          x: padding + Math.random() * (canvas.width - padding * 2),
          y: padding + Math.random() * (canvas.height - padding * 2),
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          size,
          opacity: 0.6 + Math.random() * 0.4,
          authorId: post.authorId,
          content: post.content,
          media: post.media,
        };
      });
    };

    initNodes();

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodesRef.current.forEach((node) => {
        if (draggingNodeId !== node.id) {
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

          if (Math.abs(node.vx) < 0.12 && Math.abs(node.vy) < 0.12) {
            node.vx = (Math.random() - 0.5) * 0.6;
            node.vy = (Math.random() - 0.5) * 0.6;
          }
        }

        ctx.save();
        ctx.globalAlpha = node.opacity;

        ctx.fillStyle = selectedNode?.id === node.id ? '#dbeafe' : '#f3f4f6';
        ctx.strokeStyle = selectedNode?.id === node.id ? '#3b82f6' : '#e5e7eb';
        ctx.lineWidth = selectedNode?.id === node.id ? 3 : 1;

        const radius = node.size / 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(node.x - radius, node.y - radius, node.size, node.size, 12);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      positionStore.updatePositions(
        nodesRef.current.map((node) => ({
          id: node.id,
          x: node.x,
          y: node.y,
          size: node.size,
          opacity: node.opacity,
          isDragging: node.id === draggingNodeId,
        }))
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.posts, state.userLikes, state.currentUser, draggingNodeId, selectedNode]);

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
        setDraggingNodeId(clickedNode.id);
        setSelectedNode(clickedNode);
        dragOffset.current = { x: x - clickedNode.x, y: y - clickedNode.y };
        positionStore.setDragging(clickedNode.id);
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingNodeId) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const node = nodesRef.current.find((n) => n.id === draggingNodeId);
      if (node) {
        node.x = x - dragOffset.current.x;
        node.y = y - dragOffset.current.y;
        node.vx = 0;
        node.vy = 0;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!draggingNodeId) return;

      const trashZoneX = canvas.width / 2;
      const trashZoneY = canvas.height - 80;
      const node = nodesRef.current.find((n) => n.id === draggingNodeId);

      if (node) {
        const dx = node.x - trashZoneX;
        const dy = node.y - trashZoneY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 80) {
          deletePost(node.id);
          onDelete(node.id);
          if (selectedNode?.id === node.id) {
            setSelectedNode(null);
          }
        } else {
          node.vx = (Math.random() - 0.5) * 0.6;
          node.vy = (Math.random() - 0.5) * 0.6;
        }
      }

      setDraggingNodeId(null);
      positionStore.setDragging(null);
      canvas.releasePointerCapture(e.pointerId);
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedNode = nodesRef.current.find((node) => {
        const dx = x - node.x;
        const dy = y - node.y;
        return Math.sqrt(dx * dx + dy * dy) < node.size / 2;
      });

      if (clickedNode && draggingNodeId !== clickedNode.id) {
        onCardClick(clickedNode.authorId, clickedNode.content);
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
  }, [draggingNodeId, selectedNode, deletePost, onCardClick, onDelete]);

  return (
    <div className="fixed inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
