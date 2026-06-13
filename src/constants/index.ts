export const DEFAULT_STATE = {
  posts: [],
  theme: 'white' as const,
  likedPostIds: [],
  zoomLevel: 50,
  currentUser: null,
  userName: null,
  userAvatar: null,
};

export const STORAGE_KEY = 'ion_state';
