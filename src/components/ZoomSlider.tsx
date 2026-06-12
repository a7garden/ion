import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '@/hooks/AppProvider';

export function ZoomSlider() {
  const { state, setZoomLevel } = useApp();
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
      collapseTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
    }
  }, [isMobile, clearCollapseTimer]);

  useEffect(() => {
    const checkMobile = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    setIsMobile(checkMobile);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -3 : 3;
      setZoomLevel(Math.max(10, Math.min(100, state.zoomLevel + delta)));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [state.zoomLevel, setZoomLevel]);

  useEffect(() => {
    return () => {
      clearCollapseTimer();
    };
  }, [clearCollapseTimer]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startValue = state.zoomLevel;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!trackRef.current) return;
      const dy = startY - moveEvent.clientY;
      const change = (dy / trackRef.current.offsetHeight) * 90;
      const newValue = Math.round(startValue + change);
      setZoomLevel(Math.max(10, Math.min(100, newValue)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile) {
      setIsExpanded(true);
      startCollapseTimer();
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsExpanded(false);
    }
  };

  const getCardCount = (zoomLevel: number): number => {
    return Math.round(3 + (zoomLevel / 100) * 22);
  };

  const cardCount = getCardCount(state.zoomLevel);

  return (
    <div
      className="fixed right-4 sm:right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center p-2 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl cursor-pointer transition-all duration-300 ease-out hover:border-accent/30"
      style={{
        width: isExpanded ? '56px' : '14px',
        height: isExpanded ? '240px' : '140px',
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-full flex flex-col items-center">
        <div
          className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-b from-accent/40 via-accent/20 to-accent/10 rounded-full transition-all duration-300 ease-out"
          style={{
            width: '3px',
            height: '100%',
          }}
        />

        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-accent to-accent/60 shadow-lg transition-all duration-300 ease-out"
          style={{
            width: isExpanded ? '8px' : '6px',
            height: isExpanded ? '8px' : '6px',
            bottom: `${state.zoomLevel}%`,
          }}
        />

        <div
          className="flex flex-col items-center h-full transition-all duration-200"
          style={{
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? 'auto' : 'none',
          }}
        >
          <div className="flex flex-col items-center mb-3">
            <span className="text-[9px] font-medium text-accent tracking-wider uppercase">Zoom</span>
          </div>

          <div
            ref={trackRef}
            className="flex-1 w-[3px] bg-gradient-to-b from-accent/30 to-muted/40 rounded-full relative cursor-pointer my-2"
            onMouseDown={handleMouseDown}
          >
            <div
              className="absolute bottom-0 left-0 w-full bg-gradient-to-b from-accent to-accent/50 rounded-full transition-all duration-75"
              style={{ height: `${state.zoomLevel}%` }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 w-[44px] h-[44px] bg-card border-2 border-accent/40 rounded-full shadow-lg cursor-grab flex items-center justify-center hover:bg-accent/10 hover:border-accent/60 transition-all"
              style={{ top: `${100 - state.zoomLevel}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
          </div>

          <div className="flex flex-col items-center mt-2 gap-1">
            <span className="text-[10px] font-bold text-accent">{state.zoomLevel}%</span>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-[10px] font-semibold text-foreground">{cardCount}</span>
            </div>
          </div>
        </div>

        {!isExpanded && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
          </div>
        )}
      </div>
    </div>
  );
}