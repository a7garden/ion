import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '@/hooks/AppProvider';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force';

interface GraphNode extends SimulationNodeDatum {
  id: string;
  authorId: string;
  radius: number;
  isCurrentUser: boolean;
}

interface Edge extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  isMutual: boolean;
}

export function WorldPage() {
  const { state } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const simulationRef = useRef<ReturnType<typeof forceSimulation> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const buildGraph = useCallback(() => {
    const currentUser = state.currentUser || 'guest';

    const authorSet = new Set<string>();
    state.posts.forEach(post => authorSet.add(post.authorId));
    const authors = Array.from(authorSet);

    const nodes: GraphNode[] = authors.map((author) => ({
      id: author,
      authorId: author,
      radius: 6,
      isCurrentUser: author === currentUser,
      x: dimensions.width / 2 + (Math.random() - 0.5) * 100,
      y: dimensions.height / 2 + (Math.random() - 0.5) * 100,
    }));

    const isMutualLike = (userA: string, userB: string): boolean => {
      const aLikes = state.userLikes[userA] || [];
      const bLikes = state.userLikes[userB] || [];

      const aLikedBPosts = state.posts.some(p => p.authorId === userB && aLikes.includes(p.id));
      const bLikedAPosts = state.posts.some(p => p.authorId === userA && bLikes.includes(p.id));

      return aLikedBPosts && bLikedAPosts;
    };

    const edges: Edge[] = [];
    for (let i = 0; i < authors.length; i++) {
      for (let j = i + 1; j < authors.length; j++) {
        if (isMutualLike(authors[i], authors[j])) {
          edges.push({ source: authors[i], target: authors[j], isMutual: true });
        }
      }
    }

    return { nodes, edges };
  }, [state.posts, state.userLikes, state.currentUser, dimensions]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const { nodes, edges } = buildGraph();
    nodesRef.current = nodes;

    simulationRef.current?.stop();

    simulationRef.current = forceSimulation<GraphNode>(nodes)
      .force('link', forceLink<GraphNode, Edge>(edges)
        .id(d => d.id)
        .distance(80)
        .strength(0.3))
      .force('charge', forceManyBody<GraphNode>()
        .strength(-120)
        .distanceMax(300))
      .force('center', forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collide', forceCollide<GraphNode>()
        .radius(d => d.radius + 2)
        .strength(0.8))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    simulationRef.current.on('tick', () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 0.5;

      edges.forEach(edge => {
        const source = edge.source as GraphNode;
        const target = edge.target as GraphNode;

        if (source.x === undefined || source.y === undefined ||
            target.x === undefined || target.y === undefined) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });

      nodes.forEach(node => {
        if (node.x === undefined || node.y === undefined) return;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

        if (node.isCurrentUser) {
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#fef3c7';
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      });
    });

    return () => {
      simulationRef.current?.stop();
    };
  }, [buildGraph, dimensions]);

  return (
    <div className="fixed inset-0 bg-[#1a1a1a] z-[400] pt-[60px]">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
    </div>
  );
}