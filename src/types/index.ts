import type { PlanetKey } from '@/constants/planets';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPlanet: PlanetKey;
  content: string;
  media?: string;
  mediaType?: 'image' | 'video';
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
