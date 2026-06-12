import { useState, useEffect, useCallback } from 'react';
import type { AppState, Post } from '@/types';
import { DEFAULT_STATE, STORAGE_KEY } from '@/constants';
import { getRandomPosts, createPost as createPostInDb, deletePost as deletePostFromDb, markPostAsViewed, addLike, removeLike, getUserLikedPostIds, type NeonPost } from '@/lib/neon';

function loadLocalData(): Partial<AppState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        theme: parsed.theme || 'white',
        likedPosts: parsed.likedPosts || [],
        zoomLevel: parsed.zoomLevel || 50,
        worldPageOpen: parsed.worldPageOpen || false,
        userLikes: parsed.userLikes || {},
      };
    }
  } catch (e) {
    console.log('LocalStorage unavailable');
  }
  return {};
}

function saveLocalData(data: Partial<AppState>) {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, ...data }));
  } catch (e) {
    console.log('LocalStorage unavailable');
  }
}

function neonPostToPost(neonPost: NeonPost): Post {
  return {
    id: neonPost.id,
    authorId: neonPost.author_uid,
    authorName: neonPost.author_name,
    content: neonPost.content,
    angle: neonPost.angle,
    radius: neonPost.radius,
    floatOffset: neonPost.float_offset,
    floatDelay: neonPost.float_delay,
    media: neonPost.media_url || undefined,
    bgm: neonPost.bgm_name || undefined,
  };
}

export function useAppState() {
  const localData = loadLocalData();

  const [state, setState] = useState<AppState>(() => ({
    ...DEFAULT_STATE,
    ...localData,
    posts: [],
    currentUser: null,
    userName: null,
  }));

  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    saveLocalData({
      theme: state.theme,
      likedPosts: state.likedPosts,
      zoomLevel: state.zoomLevel,
      worldPageOpen: state.worldPageOpen,
      userLikes: state.userLikes,
    });
  }, [state.theme, state.likedPosts, state.zoomLevel, state.worldPageOpen, state.userLikes]);

  const loadRandomPosts = useCallback(async (userUid: string, limit: number = 10) => {
    setIsLoadingPosts(true);
    try {
      const neonPosts = await getRandomPosts(userUid, limit);
      const posts = neonPosts.map(neonPostToPost);
      setState(prev => ({ ...prev, posts }));
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'white' ? 'black' : 'white'
    }));
  }, []);

  const toggleLike = useCallback(async (postId: string, _authorId: string) => {
    const currentUser = state.currentUser;
    if (!currentUser) return;

    const isCurrentlyLiked = state.userLikes[currentUser]?.includes(postId) || false;

    setState(prev => {
      const userLikes = { ...prev.userLikes };
      if (!userLikes[currentUser]) {
        userLikes[currentUser] = [];
      }
      const likes = [...userLikes[currentUser]];
      const index = likes.indexOf(postId);

      if (index === -1) {
        likes.push(postId);
        if (!prev.likedPosts.includes(postId)) {
          return {
            ...prev,
            userLikes,
            likedPosts: [...prev.likedPosts, postId]
          };
        }
        return { ...prev, userLikes };
      } else {
        likes.splice(index, 1);
        return { ...prev, userLikes };
      }
    });

    try {
      if (isCurrentlyLiked) {
        await removeLike(currentUser, postId);
      } else {
        await addLike(currentUser, postId);
      }
    } catch (error) {
      console.error('Failed to update like in DB:', error);
    }
  }, [state.currentUser, state.userLikes]);

  const setZoomLevel = useCallback((level: number) => {
    setState(prev => ({
      ...prev,
      zoomLevel: Math.max(10, Math.min(100, level))
    }));
  }, []);

  const login = useCallback((id: string, pw: string, displayName?: string | null) => {
    if (id === 'admin' && pw === '1234') {
      setState(prev => ({
        ...prev,
        currentUser: 'admin',
        userName: 'Admin',
        isAdmin: true
      }));
      return { success: true, message: 'Welcome, admin' };
    } else if (id && pw) {
      setState(prev => ({
        ...prev,
        currentUser: id,
        userName: displayName || null,
        isAdmin: false
      }));
      return { success: true, message: `Welcome, ${displayName || id}` };
    }
    return { success: false, message: 'Please enter ID and Password' };
  }, []);

  const setUserName = useCallback((name: string) => {
    setState(prev => ({
      ...prev,
      userName: name
    }));
  }, []);

  const logout = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentUser: null,
      userName: null,
      posts: [],
      isAdmin: false
    }));
  }, []);

  const setWorldPageOpen = useCallback((open: boolean) => {
    setState(prev => ({
      ...prev,
      worldPageOpen: open
    }));
  }, []);

  const goToMain = useCallback(() => {
    setState(prev => ({
      ...prev,
      worldPageOpen: false
    }));
  }, []);

  const addPost = useCallback(async (post: Omit<Post, 'id'>) => {
    try {
      const neonPost = await createPostInDb({
        author_uid: post.authorId,
        author_name: post.authorName || 'Anonymous',
        content: post.content,
        media_url: post.media,
        bgm_name: post.bgm,
        angle: post.angle,
        radius: post.radius,
        float_offset: post.floatOffset,
        float_delay: post.floatDelay,
      });

      const newPost = neonPostToPost(neonPost);
      setState(prev => ({
        ...prev,
        posts: [newPost, ...prev.posts]
      }));
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }, []);

  const dismissPost = useCallback(async (postId: string) => {
    const currentUser = state.currentUser;
    if (!currentUser) return;

    try {
      await markPostAsViewed(currentUser, postId);
      setState(prev => ({
        ...prev,
        posts: prev.posts.filter(p => p.id !== postId)
      }));
    } catch (error) {
      console.error('Failed to dismiss post:', error);
    }
  }, [state.currentUser]);

  const deletePost = useCallback(async (postId: string) => {
    const currentUser = state.currentUser;
    if (!currentUser) return false;

    try {
      const success = await deletePostFromDb(postId, currentUser);
      if (success) {
        setState(prev => ({
          ...prev,
          posts: prev.posts.filter(p => p.id !== postId)
        }));
      }
      return success;
    } catch (error) {
      console.error('Failed to delete post:', error);
      return false;
    }
  }, [state.currentUser]);

  const loadUserLikes = useCallback(async (userUid: string) => {
    try {
      const likedPostIds = await getUserLikedPostIds(userUid);
      setState(prev => ({
        ...prev,
        userLikes: {
          ...prev.userLikes,
          [userUid]: likedPostIds,
        },
      }));
    } catch (error) {
      console.error('Failed to load user likes:', error);
    }
  }, []);

  return {
    state,
    isLoadingPosts,
    toggleTheme,
    toggleLike,
    setZoomLevel,
    login,
    logout,
    setUserName,
    setWorldPageOpen,
    goToMain,
    addPost,
    dismissPost,
    deletePost,
    loadRandomPosts,
    loadUserLikes,
  };
}
