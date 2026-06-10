import React, { useRef, useEffect } from 'react';
import { useApp } from '@/hooks/AppProvider';

export function ZoomSlider() {
  const { state, setZoomLevel } = useApp();
  const trackRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 w-[44px] h-[200px] bg-card border border-border rounded-full z-50 flex flex-col items-center p-2">
      <span className="text-[10px] text-muted-foreground mb-2">ZOOM</span>
      <div
        ref={trackRef}
        className="flex-1 w-[2px] bg-primary/20 rounded-full relative cursor-pointer my-2"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute bottom-0 left-0 w-full bg-primary rounded-full"
          style={{ height: `${state.zoomLevel}%` }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[36px] h-[36px] bg-background border border-primary/50 rounded-full shadow cursor-grab"
          style={{ top: `${100 - state.zoomLevel}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground mt-2">{state.zoomLevel}%</span>
    </div>
  );
}