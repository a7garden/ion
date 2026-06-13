import { useRef, useEffect, useState, useCallback } from 'react';
import { useClient } from '@/hooks/ClientProvider';
import { getCardCountForViewport, getDynamicCardSize } from '@/hooks/useDeviceSize';

export function ZoomSlider() {
  const { zoomLevel, setZoomLevel } = useClient();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  }, []);

  const startCollapseTimer = useCallback(() => {
    clearCollapseTimer();
    if (isMobile) {
      collapseTimerRef.current = setTimeout(() => setIsExpanded(false), 3000);
    }
  }, [isMobile, clearCollapseTimer]);

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[role="dialog"]') || target.closest('.world-page')) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -3 : 3;
      setZoomLevel(Math.max(10, Math.min(100, zoomLevel + delta)));
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [zoomLevel, setZoomLevel]);

  useEffect(() => { return () => clearCollapseTimer(); }, [clearCollapseTimer]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startValue = zoomLevel;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!trackRef.current) return;
      const dy = startY - moveEvent.clientY;
      const change = (dy / trackRef.current.offsetHeight) * 90;
      setZoomLevel(Math.max(10, Math.min(100, Math.round(startValue + change))));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const cardSize = getDynamicCardSize(window.innerWidth, zoomLevel);
  const cardCount = getCardCountForViewport(window.innerWidth, window.innerHeight, cardSize);

  return (
    <div
      className="fixed right-4 sm:right-5 top-1/2 -translate-y-1/2 z-[450]"
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && setIsExpanded(false)}
    >
      <div
        className="relative flex items-center justify-center rounded-full bg-card/70 backdrop-blur-xl border border-border/40 transition-all duration-300 ease-out cursor-pointer hover:border-accent/30 hover:bg-card/90"
        style={{
          width: isExpanded ? 48 : 20,
          height: isExpanded ? 220 : 20,
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isMobile) {
            setIsExpanded(prev => !prev);
            startCollapseTimer();
          }
        }}
      >
        {!isExpanded && (
          <div className="w-2.5 h-2.5 rounded-full bg-accent/70" />
        )}

        {isExpanded && (
          <div className="flex flex-col items-center w-full h-full py-3 px-2">
            <span className="text-[10px] font-bold text-accent tabular-nums">{zoomLevel}%</span>

            <div
              ref={trackRef}
              className="flex-1 w-1 bg-muted/50 rounded-full relative my-2 cursor-pointer"
              onMouseDown={handleMouseDown}
              style={{ minHeight: 0 }}
            >
              <div
                className="absolute bottom-0 left-0 w-full bg-accent/40 rounded-full"
                style={{ height: `${zoomLevel}%` }}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-2 border-accent/50 rounded-full shadow-sm cursor-grab active:cursor-grabbing hover:border-accent transition-colors"
                style={{ bottom: `${zoomLevel}%`, transform: 'translate(-50%, 50%)' }}
              />
            </div>

            <div className="flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="text-[10px] font-semibold text-foreground tabular-nums">{cardCount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
