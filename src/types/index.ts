export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  media?: string;
  mediaType?: 'image' | 'video';
  createdAt?: string;
}

export type Theme = 'white' | 'black';

export interface AppState {
  posts: Post[];
  theme: Theme;
  likedPostIds: string[];
  zoomLevel: number;
  currentUser: string | null;
  userName: string | null;
  userAvatar: string | null;
}
