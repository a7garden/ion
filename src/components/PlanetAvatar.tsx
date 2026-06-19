import { getPlanet } from '@/constants/planets';
import type { PlanetKey } from '@/constants/planets';

interface PlanetAvatarProps {
  planet: PlanetKey;
  size?: number; // px
  className?: string;
  showGlow?: boolean;
}

export function PlanetAvatar({ planet, size = 40, className = '', showGlow = false }: PlanetAvatarProps) {
  const def = getPlanet(planet);
  return (
    <div
      className={`rounded-full flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: def.gradient,
        boxShadow: showGlow
          ? `0 0 ${size * 0.4}px ${def.glowColor}, 0 0 ${size * 0.8}px ${def.glowColor}40`
          : `0 2px 8px ${def.glowColor}30`,
      }}
    />
  );
}
