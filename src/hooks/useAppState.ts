import { useState, useEffect, useCallback } from 'react';
import type { AppState, Post } from '@/types';
import { DEFAULT_STATE, STORAGE_KEY } from '@/constants';
import {
  signInWithGoogle,
  signOut,
  onAuthStateChange,
  getFeed,
  getUserPosts,
  createPost,
  deletePost as deletePostDb,
  likePost,
  unlikePost,
  getMyLikedPostIds,
  updateDisplayName,
  uploadMedia,
  type FeedRow,
} from '@/lib/supabase';

// ============================================
// LocalStorage helpers (theme, zoom only)
// ============================================

function loadLocal(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme || 'white',
      zoomLevel: parsed.zoomLevel ?? 50,
    };
  } catch {
    return {};
  }
}

function saveLocal(data: Partial<AppState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      theme: data.theme,
      zoomLevel: data.zoomLevel,
    }));
  } catch { /* noop */ }
}

// ============================================
// Mapper
// ============================================

function toPost(row: FeedRow): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_display_name || 'Anonymous',
    authorAvatar: row.author_avatar_url ?? undefined,
    content: row.content || '',
    media: row.media_url ?? undefined,
    mediaType: row.media_type ?? undefined,
    createdAt: row.created_at,
  };
}

// ============================================
// Hook
// ============================================

export function useAppState() {
  const [state, setState] = useState<AppState>(() => ({
    ...DEFAULT_STATE,
    ...loadLocal(),
  }));

  // Persist theme & zoom
  useEffect(() => {
    saveLocal({ theme: state.theme, zoomLevel: state.zoomLevel });
  }, [state.theme, state.zoomLevel]);

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (user) {
        setState(prev => ({
          ...prev,
          currentUser: user.id,
          userName: user.display_name,
          userAvatar: user.avatar_url,
        }));
      } else {
        setState(prev => ({
          ...prev,
          currentUser: null,
          userName: null,
          userAvatar: null,
          posts: [],
          likedPostIds: [],
        }));
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auto-load data on login
  useEffect(() => {
    if (!state.currentUser) return;
    loadFeed(state.currentUser);
    loadLikes(state.currentUser);
  }, [state.currentUser]);

  // ---- Data loaders ----

  const loadFeed = useCallback(async (userId: string, batchSize = 10) => {
    try {
      const rows = await getFeed(userId, batchSize);
      setState(prev => ({ ...prev, posts: rows.map(toPost) }));
    } catch (e) {
      console.error('Failed to load feed:', e);
    }
  }, []);

  const loadMyPosts = useCallback(async (userId: string) => {
    try {
      const rows = await getUserPosts(userId);
      setState(prev => ({ ...prev, posts: rows.map(toPost) }));
    } catch (e) {
      console.error('Failed to load my posts:', e);
    }
  }, []);

  const loadLikes = useCallback(async (userId: string) => {
    try {
      const ids = await getMyLikedPostIds(userId);
      setState(prev => ({ ...prev, likedPostIds: ids }));
    } catch (e) {
      console.error('Failed to load likes:', e);
    }
  }, []);

  // ---- Actions ----

  const login = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setState(prev => ({
      ...prev,
      currentUser: null,
      userName: null,
      userAvatar: null,
      posts: [],
      likedPostIds: [],
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'white' ? 'black' : 'white',
    }));
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    setState(prev => ({ ...prev, zoomLevel: Math.max(10, Math.min(100, level)) }));
  }, []);

  const toggleLike = useCallback(async (postId: string) => {
    const userId = state.currentUser;
    if (!userId) return;

    const wasLiked = state.likedPostIds.includes(postId);

    // Optimistic update
    setState(prev => ({
      ...prev,
      likedPostIds: wasLiked
        ? prev.likedPostIds.filter(id => id !== postId)
        : [...prev.likedPostIds, postId],
    }));

    try {
      if (wasLiked) await unlikePost(userId, postId);
      else await likePost(userId, postId);
    } catch (e) {
      console.error('Like toggle failed:', e);
      loadLikes(userId); // rollback
    }
  }, [state.currentUser, state.likedPostIds, loadLikes]);

  const addPost = useCallback(async (opts: { content: string; mediaFile?: File }) => {
    const userId = state.currentUser;
    if (!userId) throw new Error('Not logged in');

    let mediaUrl: string | undefined;
    let mediaType: 'image' | 'video' | undefined;

    if (opts.mediaFile) {
      const result = await uploadMedia(opts.mediaFile, userId);
      mediaUrl = result.url;
      mediaType = result.type;
    }

    const row = await createPost({
      author_id: userId,
      content: opts.content,
      media_url: mediaUrl,
      media_type: mediaType,
    });

    const post: Post = {
      id: row.id,
      authorId: row.author_id,
      authorName: state.userName || 'Anonymous',
      authorAvatar: state.userAvatar ?? undefined,
      content: row.content,
      media: row.media_url ?? undefined,
      mediaType: (row.media_type as 'image' | 'video') ?? undefined,
      createdAt: row.created_at,
    };

    setState(prev => ({ ...prev, posts: [post, ...prev.posts] }));
  }, [state.currentUser, state.userName, state.userAvatar]);

  const removePost = useCallback(async (postId: string) => {
    try {
      await deletePostDb(postId);
      setState(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== postId) }));
      return true;
    } catch (e) {
      console.error('Delete failed:', e);
      return false;
    }
  }, []);

  const changeDisplayName = useCallback(async (name: string) => {
    const userId = state.currentUser;
    if (!userId || !name.trim()) return;
    const { error } = await updateDisplayName(userId, name.trim());
    if (!error) setState(prev => ({ ...prev, userName: name.trim() }));
  }, [state.currentUser]);

  const dismissPost = useCallback(async (postId: string) => {
    // Just remove from local state — feed is random anyway
    setState(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== postId) }));
  }, []);

  return {
    state,
    login,
    logout,
    toggleTheme,
    setZoomLevel,
    toggleLike,
    addPost,
    removePost,
    changeDisplayName,
    dismissPost,
    loadFeed,
    loadMyPosts,
  };
}
