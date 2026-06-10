export interface Post {
  id: string;
  authorId: string;
  content: string;
  angle: number;
  radius: number;
  floatOffset: number;
  floatDelay: number;
  media?: string;
  bgm?: string;
}

export interface Friend {
  id: string;
  name: string;
}

export type Theme = 'white' | 'black';

export interface AppState {
  posts: Post[];
  friends: Friend[];
  theme: Theme;
  sidebarOpen: boolean;
  likedPosts: string[];
  zoomLevel: number;
  worldPageOpen: boolean;
  currentUser: string | null;
  userLikes: Record<string, string[]>;
  isAdmin: boolean;
}