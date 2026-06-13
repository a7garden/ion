import { useEffect, useRef, useState, useCallback } from 'react';
import { useI18n } from '@/i18n';
import { useClient } from '@/hooks/ClientProvider';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from 'd3-force';
import type { Post } from '@/types';
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

interface WorldPageProps {
  posts: Post[];
  likedIds: string[];
  currentUserId: string;
  currentUserPlanet: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

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

const PLANET_COLORS: Record<string, { light: string; mid: string; dark: string; glow: string }> = {
  moon:    { light: 'hsl(45, 10%, 97%)', mid: 'hsl(42, 8%, 92%)', dark: 'hsl(40, 5%, 85%)', glow: 'hsl(45, 50%, 80%)' },
  earth:   { light: 'hsl(155, 45%, 64%)', mid: 'hsl(210, 55%, 57%)', dark: 'hsl(210, 58%, 41%)', glow: 'hsl(200, 60%, 60%)' },
  mars:    { light: 'hsl(30, 85%, 49%)', mid: 'hsl(15, 85%, 41%)', dark: 'hsl(10, 70%, 34%)', glow: 'hsl(20, 80%, 55%)' },
  crystal: { light: 'hsl(280, 65%, 80%)', mid: 'hsl(280, 45%, 53%)', dark: 'hsl(210, 65%, 62%)', glow: 'hsl(270, 60%, 70%)' },
  saturn:  { light: 'hsl(48, 85%, 62%)', mid: 'hsl(45, 75%, 59%)', dark: 'hsl(35, 60%, 50%)', glow: 'hsl(45, 75%, 60%)' },
  jupiter: { light: 'hsl(30, 65%, 70%)', mid: 'hsl(25, 45%, 60%)', dark: 'hsl(15, 55%, 42%)', glow: 'hsl(25, 55%, 60%)' },
  venus:   { light: 'hsl(350, 50%, 83%)', mid: 'hsl(350, 40%, 72%)', dark: 'hsl(25, 40%, 59%)', glow: 'hsl(10, 50%, 75%)' },
  neptune: { light: 'hsl(200, 40%, 70%)', mid: 'hsl(215, 35%, 37%)', dark: 'hsl(215, 55%, 23%)', glow: 'hsl(210, 50%, 60%)' },
  uranus:  { light: 'hsl(155, 50%, 75%)', mid: 'hsl(170, 40%, 60%)', dark: 'hsl(170, 35%, 48%)', glow: 'hsl(170, 50%, 70%)' },
  pluto:   { light: 'hsl(35, 20%, 70%)', mid: 'hsl(30, 15%, 49%)', dark: 'hsl(25, 15%, 36%)', glow: 'hsl(35, 25%, 65%)' },
};

function drawPlanet(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, planetKey: string) {
  const colors = PLANET_COLORS[planetKey] ?? PLANET_COLORS.moon;
  const gradient = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
  gradient.addColorStop(0, colors.light);
  gradient.addColorStop(0.5, colors.mid);
  gradient.addColorStop(1, colors.dark);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Subtle surface detail for moon specifically
  if (planetKey === 'moon') {
    const craters = [
      { x: cx - radius * 0.3, y: cy - radius * 0.2, r: radius * 0.12 },
      { x: cx + radius * 0.2, y: cy + radius * 0.3, r: radius * 0.08 },
      { x: cx - radius * 0.1, y: cy + radius * 0.1, r: radius * 0.06 },
    ];
    for (const crater of craters) {
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.r, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(30, 10%, 55%, 0.12)';
      ctx.fill();
    }
  }
}

export function WorldPage({ posts, likedIds, currentUserId, currentUserPlanet, isLoading, isError, onRetry }: WorldPageProps) {
  const { t } = useI18n();
  const { setZoomLevel } = useClient();
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
  const moonAnimStartRef = useRef<number>(0);
  const moonAnimProgressRef = useRef<number>(0);
  const MOON_ANIM_DURATION = 900;

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const touchStateRef = useRef<TouchState>({
    touches: [],
    initialPinchDistance: null,
    initialScale: 1,
  });
  const isInternalZoomRef = useRef(false);

  const scaleToZoom = useCallback((scale: number) => Math.round(10 + (scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE) * 90), []);
  // WorldPage는 자체 zoom 관리, ZoomSlider에 동기화만

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
    const authorSet = new Set<string>();
    posts.forEach(post => authorSet.add(post.authorId));
    const authors = Array.from(authorSet);

    const graphNodes: GraphNode[] = authors.map((author, idx) => ({
      id: author,
      authorId: author,
      radius: 10 + Math.random() * 6,
      isCurrentUser: author === currentUserId,
      x: dimensions.width / 2 + (Math.random() - 0.5) * 200,
      y: dimensions.height / 2 + (Math.random() - 0.5) * 200,
      color: `hsla(${38 + idx * 15}, 70%, ${60 + Math.random() * 20}%, 0.9)`,
      glowColor: author === currentUserId
        ? 'hsla(45, 90%, 65%, 0.6)'
        : 'hsla(38, 80%, 55%, 0.3)',
    }));

    const isMutualLike = (userA: string, userB: string): boolean => {
      const aLiked = likedIds.some(pid =>
        posts.some(p => p.id === pid && p.authorId === userB));
      const bLiked = likedIds.some(pid =>
        posts.some(p => p.id === pid && p.authorId === userA));
      return aLiked && bLiked;
    };

    const graphEdges: Edge[] = [];
    for (let i = 0; i < authors.length; i++) {
      for (let j = i + 1; j < authors.length; j++) {
        if (isMutualLike(authors[i], authors[j])) {
          graphEdges.push({ source: authors[i], target: authors[j], isMutual: true });
        }
      }
    }

    return { nodes: graphNodes, edges: graphEdges };
  }, [posts, likedIds, currentUserId, dimensions]);

  const renderLoopRef = useRef<(() => void) | null>(null);

  const startRenderLoop = useCallback(() => {
    if (moonAnimStartRef.current === 0) {
      moonAnimStartRef.current = Date.now();
    }
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
    moonAnimStartRef.current = Date.now();
    moonAnimProgressRef.current = 0;

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

      const moonBaseRadius = 50;

      const elapsed = Date.now() - moonAnimStartRef.current;
      const rawT = Math.min(1, elapsed / MOON_ANIM_DURATION);
      const t = rawT === 0 ? 0 : rawT >= 1 ? 1 : Math.pow(2, -10 * rawT) * Math.sin((rawT * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
      moonAnimProgressRef.current = t;

      const screenCenterX = (dimensions.width / 2 - currentTransform.x) / currentTransform.scale;
      const screenCenterY = (dimensions.height / 2 - currentTransform.y) / currentTransform.scale;

      let targetX = screenCenterX;
      let targetY = screenCenterY;
      if (currentViewMode === 'centered' && myNode && myNode.x !== undefined && myNode.y !== undefined) {
        targetX = myNode.x;
        targetY = myNode.y;
      }

      const blendT = Math.min(1, rawT * 2);
      const moonX = screenCenterX + (targetX - screenCenterX) * blendT;
      const moonY = screenCenterY + (targetY - screenCenterY) * blendT;

      const moonScale = t;
      const moonYOffset = (1 - t) * 120;
      const moonRadius = moonBaseRadius * moonScale;

      drawPlanet(ctx, moonX, moonY + moonYOffset, moonRadius, currentUserPlanet);

      if (t < 1 && moonRadius > 5) {
        const glowAlpha = (1 - t) * 0.4;
        const glowGrad = ctx.createRadialGradient(moonX, moonY + moonYOffset, moonRadius * 0.5, moonX, moonY + moonYOffset, moonRadius * 2.5);
        glowGrad.addColorStop(0, `hsla(45, 80%, 85%, ${glowAlpha})`);
        glowGrad.addColorStop(1, 'hsla(45, 80%, 85%, 0)');
        ctx.beginPath();
        ctx.arc(moonX, moonY + moonYOffset, moonRadius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }

      const currentEdges = edgesRef.current;
      for (let i = 0; i < currentEdges.length; i++) {
        const edge = currentEdges[i];
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

      const currentNodes = nodesRef.current;
      const now = Date.now();
      const rotation = now * 0.0005;

      for (let i = 0; i < currentNodes.length; i++) {
        const node = currentNodes[i];
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
  }, [startRenderLoop]);

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
    isInternalZoomRef.current = true;
    setZoomLevel(scaleToZoom(newScale));
    startRenderLoop();
  }, [startRenderLoop, setZoomLevel, scaleToZoom]);

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
  }, [startRenderLoop]);

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
      isInternalZoomRef.current = true;
      setZoomLevel(scaleToZoom(newScale));
      startRenderLoop();
    }
  }, [startRenderLoop, setZoomLevel, scaleToZoom]);

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

  // Loading / Error states
  if (isLoading) {
    return (
      <div className="world-page">
        <div className="world-page__backdrop" />
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="world-page">
        <div className="world-page__backdrop" />
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{t('world.failed')}</p>
            <button onClick={onRetry} className="px-4 py-2 bg-accent text-accent-foreground rounded-xl">
              {t('world.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="world-page">
      <div className="world-page__backdrop" />
      <div className="world-page__controls">
        <button
          className="world-page__btn"
          onClick={handleGoToMyNode}
          title={t('world.goToMyLocation')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
          </svg>
          {t('world.goToMyLocation')}</button>
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
          {viewMode === 'full' ? t('world.fullView') : t('world.centeredView')}
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
            {t('world.connectionSettings')}
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
              <span className="world-page__slider-label">{t('world.linkStrength')}</span>
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
              <span className="world-page__slider-label">{t('world.chargeStrength')}</span>
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
              <span className="world-page__slider-label">{t('world.collideStrength')}</span>
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
              <span className="world-page__slider-label">{t('world.center')}</span>
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
              <span className="world-page__slider-label">{t('world.linkDistance')}</span>
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
        {t('world.exploreHint')}
      </div>
    </div>
  );
}
