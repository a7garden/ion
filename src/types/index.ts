export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  angle: number;
  radius: number;
  floatOffset: number;
  floatDelay: number;
  media?: string;
  thumbnail?: string;
  bgm?: string;
}

export type Theme = 'white' | 'black';

export interface AppState {
  posts: Post[];
  theme: Theme;
  likedPosts: string[];
  zoomLevel: number;
  worldPageOpen: boolean;
  currentUser: string | null;
  userName: string | null;
  userLikes: Record<string, string[]>;
  isAdmin: boolean;
}
