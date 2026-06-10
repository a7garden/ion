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
      const delta = e.deltaY > 0 ? -5 : 5;
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

  const handleClick = () => {
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

  return (
    <div
      className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center p-2 bg-card/80 backdrop-blur-sm border border-border rounded-full cursor-pointer transition-all duration-300 ease-out"
      style={{
        width: isExpanded ? '44px' : '12px',
        height: isExpanded ? '200px' : '120px',
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-full flex flex-col items-center">
        <div
          className="absolute left-1/2 -translate-x-1/2 bg-primary/20 rounded-full transition-all duration-300 ease-out"
          style={{
            width: '2px',
            height: '100%',
          }}
        />

        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-primary shadow-md transition-all duration-300 ease-out"
          style={{
            width: isExpanded ? '6px' : '6px',
            height: isExpanded ? '6px' : '6px',
            bottom: `${state.zoomLevel}%`,
          }}
        />

        <div
          className="flex flex-col items-center h-full transition-opacity duration-200"
          style={{
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? 'auto' : 'none',
          }}
        >
          <span className="text-[10px] text-muted-foreground mb-2">ZOOM</span>
          <div
            ref={trackRef}
            className="flex-1 w-[2px] bg-primary/20 rounded-full relative cursor-pointer my-2"
            onMouseDown={handleMouseDown}
          >
            <div
              className="absolute bottom-0 left-0 w-full bg-primary rounded-full transition-all duration-150"
              style={{ height: `${state.zoomLevel}%` }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 w-[36px] h-[36px] bg-background border border-primary/50 rounded-full shadow cursor-grab"
              style={{ top: `${100 - state.zoomLevel}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground mt-2">{state.zoomLevel}%</span>
        </div>
      </div>
    </div>
  );
}