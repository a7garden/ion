import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '@/hooks/AppProvider';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from 'd3-force';
import './WorldPage.css';

interface GraphNode {
  id: string;
  authorId: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius: number;
  isCurrentUser: boolean;
  color: string;
  glowColor: string;
}

interface Edge {
  source: string | GraphNode;
  target: string | GraphNode;
  isMutual: boolean;
}

interface CohesionSettings {
  linkStrength: number;
  chargeStrength: number;
  collideStrength: number;
  centerStrength: number;
  linkDistance: number;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface TouchState {
  touches: Array<{ x: number; y: number }>;
  initialPinchDistance: number | null;
  initialScale: number;
}

type RenderMode = 'active' | 'idle';

const DEFAULT_COHESION: CohesionSettings = {
  linkStrength: 0.3,
  chargeStrength: -180,
  collideStrength: 0.6,
  centerStrength: 0.1,
  linkDistance: 120,
};

const MIN_SCALE = 0.3;
const MAX_SCALE = 3.0;

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerRadius: number, innerRadius: number, points: number, rotation: number) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2 + rotation;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
}

function drawMoon(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  const moonGradient = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
  moonGradient.addColorStop(0, 'hsl(45, 10%, 97%)');
  moonGradient.addColorStop(0.5, 'hsl(42, 8%, 92%)');
  moonGradient.addColorStop(1, 'hsl(40, 5%, 85%)');

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = moonGradient;
  ctx.fill();

  const craters = [
    { x: cx - radius * 0.3, y: cy - radius * 0.2, r: radius * 0.12 },
    { x: cx + radius * 0.2, y: cy + radius * 0.3, r: radius * 0.08 },
    { x: cx - radius * 0.1, y: cy + radius * 0.1, r: radius * 0.06 },
  ];

  for (let i = 0; i < craters.length; i++) {
    const crater = craters[i];
    ctx.beginPath();
    ctx.arc(crater.x, crater.y, crater.r, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(30, 10%, 55%, 0.12)';
    ctx.fill();
  }
}

export function WorldPage() {
  const { state } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const simulationRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [viewMode, setViewMode] = useState<'full' | 'centered'>('centered');
  const [cohesion, setCohesion] = useState<CohesionSettings>(DEFAULT_COHESION);
  const [panelOpen, setPanelOpen] = useState(false);

  const transformRef = useRef(transform);
  const viewModeRef = useRef(viewMode);
  const cohesionRef = useRef(cohesion);
  const renderModeRef = useRef<RenderMode>('active');

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const touchStateRef = useRef<TouchState>({
    touches: [],
    initialPinchDistance: null,
    initialScale: 1,
  });

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    cohesionRef.current = cohesion;
  }, [cohesion]);

  const buildGraph = useCallback(() => {
    const currentUser = state.currentUser || '';

    const authorSet = new Set<string>();
    state.posts.forEach(post => authorSet.add(post.authorId));
    const authors = Array.from(authorSet);

    const nodes: GraphNode[] = authors.map((author, idx) => ({
      id: author,
      authorId: author,
      radius: 10 + Math.random() * 6,
      isCurrentUser: author === currentUser,
      x: dimensions.width / 2 + (Math.random() - 0.5) * 200,
      y: dimensions.height / 2 + (Math.random() - 0.5) * 200,
      color: `hsla(${38 + idx * 15}, 70%, ${60 + Math.random() * 20}%, 0.9)`,
      glowColor: author === currentUser
        ? 'hsla(45, 90%, 65%, 0.6)'
        : 'hsla(38, 80%, 55%, 0.3)',
    }));

    const isMutualLike = (userA: string, userB: string): boolean => {
      const aLiked = state.likedPostIds.some(pid =>
        state.posts.some(p => p.id === pid && p.authorId === userB));
      const bLiked = state.likedPostIds.some(pid =>
        state.posts.some(p => p.id === pid && p.authorId === userA));
      return aLiked && bLiked;
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
  }, [state.posts, state.likedPostIds, state.currentUser, dimensions]);

  const renderLoopRef = useRef<(() => void) | null>(null);

  const startRenderLoop = useCallback(() => {
    if (renderModeRef.current === 'idle') {
      renderModeRef.current = 'active';
      simulationRef.current?.alpha(0.3).restart();
    }

    const loop = () => {
      if (renderModeRef.current !== 'active') {
        animationFrameRef.current = 0;
        return;
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    renderLoopRef.current = loop;
    loop();
  }, []);

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
    edgesRef.current = edges;

    simulationRef.current?.stop();
    renderModeRef.current = 'active';

    const simulation = forceSimulation<GraphNode>(nodes)
      .force('link', forceLink<GraphNode, Edge>(edges)
        .id((d) => d.id)
        .distance(cohesion.linkDistance)
        .strength(cohesion.linkStrength))
      .force('charge', forceManyBody<GraphNode>()
        .strength(cohesion.chargeStrength)
        .distanceMax(450))
      .force('center', forceCenter(dimensions.width / 2, dimensions.height / 2)
        .strength(cohesion.centerStrength))
      .force('collide', forceCollide<GraphNode>()
        .radius((d) => d.radius + 8)
        .strength(cohesion.collideStrength))
      .alphaDecay(0.012)
      .velocityDecay(0.3);

    simulationRef.current = simulation;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const currentTransform = transformRef.current;
      const currentViewMode = viewModeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(currentTransform.x, currentTransform.y);
      ctx.scale(currentTransform.scale, currentTransform.scale);

      const myNode = nodesRef.current.find(n => n.isCurrentUser);

      let moonX = dimensions.width / 2;
      let moonY = dimensions.height / 2;
      const moonRadius = 50;

      if (currentViewMode === 'centered' && myNode && myNode.x !== undefined && myNode.y !== undefined) {
        moonX = myNode.x;
        moonY = myNode.y;
      }

      drawMoon(ctx, moonX, moonY, moonRadius);

      const edges = edgesRef.current;
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const source = edge.source as GraphNode;
        const target = edge.target as GraphNode;

        if (source.x === undefined || source.y === undefined ||
            target.x === undefined || target.y === undefined) continue;

        const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
        gradient.addColorStop(0, 'hsla(38, 70%, 55%, 0.3)');
        gradient.addColorStop(0.5, 'hsla(45, 80%, 70%, 0.5)');
        gradient.addColorStop(1, 'hsla(38, 70%, 55%, 0.3)');

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = 'hsla(45, 90%, 80%, 0.2)';
        ctx.lineWidth = 3;
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }

      const nodes = nodesRef.current;
      const now = Date.now();
      const rotation = now * 0.0005;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.x === undefined || node.y === undefined) continue;

        if (node.isCurrentUser) continue;

        const starOuterRadius = node.radius * 0.375;
        const starInnerRadius = node.radius * 0.15;
        const starRotation = rotation + i;

        const starGradient = ctx.createRadialGradient(
          node.x - starOuterRadius * 0.2,
          node.y - starOuterRadius * 0.2,
          0,
          node.x,
          node.y,
          starOuterRadius
        );
        starGradient.addColorStop(0, 'hsl(40, 85%, 78%)');
        starGradient.addColorStop(0.6, 'hsl(38, 75%, 55%)');
        starGradient.addColorStop(1, 'hsl(32, 65%, 42%)');

        ctx.fillStyle = starGradient;
        drawStar(ctx, node.x, node.y, starOuterRadius, starInnerRadius, 5, starRotation);

        ctx.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
        drawStar(ctx, node.x - starOuterRadius * 0.15, node.y - starOuterRadius * 0.15, starOuterRadius * 0.25, starInnerRadius * 0.25, 5, starRotation);
      }

      ctx.restore();
    };

    simulation.on('tick', () => {
      render();
    });

    simulation.on('end', () => {
      renderModeRef.current = 'idle';
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      render();
    });

    const loop = () => {
      if (renderModeRef.current !== 'active') return;
      render();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    renderLoopRef.current = loop;
    loop();

    return () => {
      simulation.on('tick', null as any);
      simulation.on('end', null as any);
      simulation.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
    };
  }, [buildGraph, dimensions]);

  useEffect(() => {
    if (!simulationRef.current || dimensions.width === 0) return;

    const currentCohesion = cohesionRef.current;
    const currentViewMode = viewModeRef.current;
    const myNode = nodesRef.current.find(n => n.isCurrentUser);

    let centerX = dimensions.width / 2;
    let centerY = dimensions.height / 2;

    if (currentViewMode === 'centered' && myNode && myNode.x !== undefined && myNode.y !== undefined) {
      centerX = myNode.x;
      centerY = myNode.y;
    }

    simulationRef.current
      .force('link', forceLink<GraphNode, Edge>(edgesRef.current)
        .id((d) => d.id)
        .distance(currentCohesion.linkDistance)
        .strength(currentCohesion.linkStrength))
      .force('charge', forceManyBody<GraphNode>()
        .strength(currentCohesion.chargeStrength)
        .distanceMax(450))
      .force('center', forceCenter(centerX, centerY)
        .strength(currentCohesion.centerStrength))
      .force('collide', forceCollide<GraphNode>()
        .radius((d) => d.radius + 8)
        .strength(currentCohesion.collideStrength));

    startRenderLoop();
  }, [viewMode, cohesion, dimensions, startRenderLoop]);

  const handleGoToMyNode = useCallback(() => {
    const myNode = nodesRef.current.find(n => n.isCurrentUser);
    if (myNode && myNode.x !== undefined && myNode.y !== undefined) {
      setTransform({ x: 0, y: 0, scale: 1 });
      setViewMode('centered');
      startRenderLoop();
    }
  }, [startRenderLoop, dimensions]);

const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const currentScale = transformRef.current.scale;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, currentScale * delta));

    const currentTransform = transformRef.current;
    const mouseX = (e.clientX - currentTransform.x) / currentScale;
    const mouseY = (e.clientY - currentTransform.y) / currentScale;

    const newX = currentTransform.x - mouseX * (newScale - currentScale);
    const newY = currentTransform.y - mouseY * (newScale - currentScale);

    setTransform({ x: newX, y: newY, scale: newScale });
    startRenderLoop();
  }, [startRenderLoop]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setTransform(prev => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
    startRenderLoop();
  }, [startRenderLoop, dimensions]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      touchStateRef.current = {
        touches: [],
        initialPinchDistance: getTouchDistance(e.touches),
        initialScale: transformRef.current.scale,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDraggingRef.current) {
      const dx = e.touches[0].clientX - lastPosRef.current.x;
      const dy = e.touches[0].clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setTransform(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      startRenderLoop();
} else if (e.touches.length === 2 && touchStateRef.current.initialPinchDistance) {
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / touchStateRef.current.initialPinchDistance;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, touchStateRef.current.initialScale * scale));

      const touchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const touchCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const currentTransform = transformRef.current;
      const pinchCenterX = (touchCenterX - currentTransform.x) / currentTransform.scale;
      const pinchCenterY = (touchCenterY - currentTransform.y) / currentTransform.scale;

      const newX = currentTransform.x - pinchCenterX * (newScale - currentTransform.scale);
      const newY = currentTransform.y - pinchCenterY * (newScale - currentTransform.scale);
      setTransform({ x: newX, y: newY, scale: newScale });
      startRenderLoop();
    }
  }, [startRenderLoop, dimensions]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    touchStateRef.current = {
      touches: [],
      initialPinchDistance: null,
      initialScale: 1,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const handleSliderChange = (key: keyof CohesionSettings, value: number) => {
    setCohesion(prev => ({ ...prev, [key]: value }));
    startRenderLoop();
  };

  return (
    <div className="world-page">
      <div className="world-page__backdrop" />
      <div className="world-page__controls">
        <button
          className="world-page__btn"
          onClick={handleGoToMyNode}
          title="내 위치로 이동"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
          </svg>
          내 위치로 이동</button>
        <button
          className={`world-page__btn ${viewMode === 'full' ? 'world-page__btn--active' : ''}`}
          onClick={() => setViewMode(prev => prev === 'centered' ? 'full' : 'centered')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {viewMode === 'full' ? (
              <circle cx="12" cy="12" r="3" />
            ) : (
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a7 7 0 11 0 14 7 7 0 0 1 0-14z" />
            )}
          </svg>
          {viewMode === 'full' ? '전체 보기' : '특정 보기'}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="world-page__canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      <div className="world-page__panel">
        <div className="world-page__panel-header" onClick={() => setPanelOpen(prev => !prev)}>
          <div className="world-page__panel-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83" />
            </svg>
            연결 설정
          </div>
          <div className={`world-page__panel-toggle ${!panelOpen ? 'world-page__panel-toggle--collapsed' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
        <div className={`world-page__panel-content ${!panelOpen ? 'world-page__panel-content--collapsed' : ''}`}>
          <div className="world-page__slider-group">
            <div className="world-page__slider-row">
              <span className="world-page__slider-label">연결 강도</span>
              <input
                type="range"
                className="world-page__slider"
                min="0.05"
                max="1"
                step="0.05"
                value={cohesion.linkStrength}
                onChange={(e) => handleSliderChange('linkStrength', parseFloat(e.target.value))}
              />
              <span className="world-page__slider-value">{cohesion.linkStrength.toFixed(2)}</span>
            </div>
            <div className="world-page__slider-row">
              <span className="world-page__slider-label">충전 강도</span>
              <input
                type="range"
                className="world-page__slider"
                min="-500"
                max="-30"
                step="10"
                value={cohesion.chargeStrength}
                onChange={(e) => handleSliderChange('chargeStrength', parseFloat(e.target.value))}
              />
              <span className="world-page__slider-value">{cohesion.chargeStrength}</span>
            </div>
            <div className="world-page__slider-row">
              <span className="world-page__slider-label">충돌 강도</span>
              <input
                type="range"
                className="world-page__slider"
                min="0.1"
                max="1"
                step="0.05"
                value={cohesion.collideStrength}
                onChange={(e) => handleSliderChange('collideStrength', parseFloat(e.target.value))}
              />
              <span className="world-page__slider-value">{cohesion.collideStrength.toFixed(2)}</span>
            </div>
            <div className="world-page__slider-row">
              <span className="world-page__slider-label">중심</span>
              <input
                type="range"
                className="world-page__slider"
                min="0"
                max="0.5"
                step="0.02"
                value={cohesion.centerStrength}
                onChange={(e) => handleSliderChange('centerStrength', parseFloat(e.target.value))}
              />
              <span className="world-page__slider-value">{cohesion.centerStrength.toFixed(2)}</span>
            </div>
            <div className="world-page__slider-row">
              <span className="world-page__slider-label">링크 거리</span>
              <input
                type="range"
                className="world-page__slider"
                min="50"
                max="300"
                step="10"
                value={cohesion.linkDistance}
                onChange={(e) => handleSliderChange('linkDistance', parseFloat(e.target.value))}
              />
              <span className="world-page__slider-value">{cohesion.linkDistance}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="world-page__zoom-hint">
        스크롤 / 핀치 줌으로 탐색
      </div>
    </div>
  );
}

