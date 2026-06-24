import type { PlanetKey } from '@/constants/planets';

export type TextOverlayColor = 'white' | 'black' | 'color';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPlanet: PlanetKey;
  content: string;
  media?: string;
  mediaType?: 'image' | 'video';
  textOverlay?: TextOverlayColor;
  textColor?: string;
  createdAt?: string;
}
export interface Resonance {
  id: string;
  userA: string;
  userB: string;
  postA: string;
  postB: string;
  seen: boolean;
  createdAt: string;
}

export type Theme = 'white' | 'black';
