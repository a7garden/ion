import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop';

interface DeviceSize {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
}

function getBreakpoint(width: number): Breakpoint {
  if (width < 640) return 'mobile';
  if (width < 768) return 'tablet';
  if (width < 1024) return 'laptop';
  return 'desktop';
}

export function useDeviceSize(): DeviceSize {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    breakpoint: getBreakpoint(typeof window !== 'undefined' ? window.innerWidth : 1024),
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 640 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 640 && window.innerWidth < 768 : false,
    isLaptop: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  }));

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = getBreakpoint(width);

      setDeviceSize({
        width,
        height,
        breakpoint,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 768,
        isLaptop: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceSize;
}

export function getCardSizeForBreakpoint(breakpoint: Breakpoint, zoomLevel: number): number {
  const baseSizes: Record<Breakpoint, number> = {
    mobile: 280,
    tablet: 300,
    laptop: 340,
    desktop: 380,
  };

  const maxSizes: Record<Breakpoint, number> = {
    mobile: 320,
    tablet: 360,
    laptop: 400,
    desktop: 450,
  };

  const base = baseSizes[breakpoint];
  const max = maxSizes[breakpoint];
  const zoomFactor = 1 + (zoomLevel / 100) * 0.3;

  return Math.min(base * zoomFactor, max);
}

export function getDynamicCardSize(windowWidth: number, zoomLevel: number): number {
  const minSize = 80;
  const maxSize = 260;
  const zoomFactor = 1 + (zoomLevel / 100) * 1.5;

  if (windowWidth < 640) {
    return Math.min(75 * zoomFactor, maxSize);
  }

  const base = windowWidth * 0.09;

  return Math.max(minSize, Math.min(base * zoomFactor, maxSize));
}

export function getCardCountForViewport(windowWidth: number, windowHeight: number, cardSize: number): number {
  const TOP_OFFSET = 72;
  const CARD_MARGIN = 20;
  const DENSITY = 0.35;

  const effectiveWidth = windowWidth;
  const effectiveHeight = windowHeight - TOP_OFFSET;
  const cellSize = cardSize + CARD_MARGIN;

  const cols = Math.max(1, Math.floor(effectiveWidth / cellSize));
  const rows = Math.max(1, Math.floor(effectiveHeight / cellSize));

  return Math.max(1, Math.round(cols * rows * DENSITY));
}