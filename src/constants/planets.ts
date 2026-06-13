export type PlanetKey = 'moon' | 'earth' | 'mars' | 'crystal' | 'saturn' | 'jupiter' | 'venus' | 'neptune' | 'uranus' | 'pluto';

export interface PlanetDef {
  key: PlanetKey;
  name: string;
  nameKo: string;
  emoji: string;
  gradient: string; // CSS gradient string
  glowColor: string; // HSL for glow effects
}

export const PLANETS: Record<PlanetKey, PlanetDef> = {
  moon: {
    key: 'moon',
    name: 'Moon',
    nameKo: '달',
    emoji: '🌙',
    gradient: 'radial-gradient(circle at 35% 35%, #F5E6CA, #D4C5A9 60%, #B8A88A)',
    glowColor: 'hsl(45, 50%, 80%)',
  },
  earth: {
    key: 'earth',
    name: 'Earth',
    nameKo: '지구',
    emoji: '🌍',
    gradient: 'radial-gradient(circle at 35% 35%, #7EC8A0, #4A90D9 60%, #2D6BA4)',
    glowColor: 'hsl(200, 60%, 60%)',
  },
  mars: {
    key: 'mars',
    name: 'Mars',
    nameKo: '화성',
    emoji: '🔴',
    gradient: 'radial-gradient(circle at 35% 35%, #E77D11, #C1440E 60%, #8B2500)',
    glowColor: 'hsl(20, 80%, 55%)',
  },
  crystal: {
    key: 'crystal',
    name: 'Crystal',
    nameKo: '수정',
    emoji: '💎',
    gradient: 'radial-gradient(circle at 35% 35%, #D4A5FF, #9B59B6 50%, #74B9FF 100%)',
    glowColor: 'hsl(270, 60%, 70%)',
  },
  saturn: {
    key: 'saturn',
    name: 'Saturn',
    nameKo: '토성',
    emoji: '🪐',
    gradient: 'radial-gradient(circle at 35% 35%, #F0D060, #E8C547 50%, #C4953A)',
    glowColor: 'hsl(45, 75%, 60%)',
  },
  jupiter: {
    key: 'jupiter',
    name: 'Jupiter',
    nameKo: '목성',
    emoji: '🟤',
    gradient: 'radial-gradient(circle at 35% 35%, #E8B87A, #D4A574 40%, #A0522D)',
    glowColor: 'hsl(25, 55%, 60%)',
  },
  venus: {
    key: 'venus',
    name: 'Venus',
    nameKo: '금성',
    emoji: '🟡',
    gradient: 'radial-gradient(circle at 35% 35%, #F2D4D8, #E8B4B8 50%, #C4956A)',
    glowColor: 'hsl(10, 50%, 75%)',
  },
  neptune: {
    key: 'neptune',
    name: 'Neptune',
    nameKo: '해왕성',
    emoji: '🔵',
    gradient: 'radial-gradient(circle at 35% 35%, #98C1D9, #3D5A80 60%, #1B3A5C)',
    glowColor: 'hsl(210, 50%, 60%)',
  },
  uranus: {
    key: 'uranus',
    name: 'Uranus',
    nameKo: '천왕성',
    emoji: '🟢',
    gradient: 'radial-gradient(circle at 35% 35%, #A8E6CF, #73C2BE 60%, #4EA8A0)',
    glowColor: 'hsl(170, 50%, 70%)',
  },
  pluto: {
    key: 'pluto',
    name: 'Pluto',
    nameKo: '명왕성',
    emoji: '⚪',
    gradient: 'radial-gradient(circle at 35% 35%, #C9B99A, #8B7D6B 60%, #6B5E4F)',
    glowColor: 'hsl(35, 25%, 65%)',
  },
};

export const PLANET_LIST = Object.values(PLANETS);

export function getPlanet(key: string): PlanetDef {
  return PLANETS[key as PlanetKey] ?? PLANETS.moon;
}
