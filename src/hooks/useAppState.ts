import { useState, useEffect, useCallback } from 'react';
import type { AppState, Post } from '@/types';
import { DEFAULT_STATE, STORAGE_KEY } from '@/constants';
import {
  signInWithGoogle as supabaseSignInWithGoogle,
  signOut as supabaseSignOut,
  onAuthChange,
  getRandomUnviewedPosts,
  getUserPosts,
  createPost as createPostInDb,
  deletePost as deletePostFromDb,
  markPostAsViewed,
  addLike,
  removeLike,
  getUserLikedPostIds,
  updateDisplayName as updateDisplayNameInDb,
  uploadPostMedia,
  type Post as SupabasePost,
} from '@/lib/supabase';

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
        // userLikes는 DB에서 로드하므로 localStorage에 저장하지 않음
      };
    }
  } catch {
    console.log('LocalStorage unavailable');
  }
  return {};
}

function saveLocalData(data: Partial<AppState>) {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, ...data }));
  } catch {
    console.log('LocalStorage unavailable');
  }
}

function supabasePostToPost(sp: SupabasePost): Post {
  return {
    id: sp.id,
    authorId: sp.author_id,
    authorName: (sp as any).author_name || (sp as any).profiles?.display_name || 'Anonymous',
    authorAvatar: (sp as any).author_avatar || (sp as any).profiles?.avatar_url,
    content: sp.content || '',
    angle: sp.angle,
    radius: sp.radius,
    floatOffset: sp.float_offset,
    floatDelay: sp.float_delay,
    media: sp.media_url || undefined,
    mediaType: sp.media_type || undefined,
    createdAt: sp.created_at,
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
    userAvatar: null,
  }));

  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // 로컬 상태 저장
  useEffect(() => {
    saveLocalData({
      theme: state.theme,
      likedPosts: state.likedPosts,
      zoomLevel: state.zoomLevel,
      worldPageOpen: state.worldPageOpen,
      // userLikes는 DB에서 로드하므로 제외 (성능 + 동기화)
    });
  }, [state.theme, state.likedPosts, state.zoomLevel, state.worldPageOpen, state.userLikes]);

  // 인증 상태 감시
  useEffect(() => {
    const { data: { subscription } } = onAuthChange((user) => {
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
          isAdmin: false,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadRandomPosts = useCallback(async (userUid: string, limit: number = 10) => {
    setIsLoadingPosts(true);
    try {
      const supabasePosts = await getRandomUnviewedPosts(userUid, limit);
      const posts = supabasePosts.map(supabasePostToPost);
      setState(prev => ({ ...prev, posts }));
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  const loadMyPosts = useCallback(async (userUid: string) => {
    setIsLoadingPosts(true);
    try {
      const supabasePosts = await getUserPosts(userUid);
      const posts = supabasePosts.map(supabasePostToPost);
      setState(prev => ({ ...prev, posts }));
    } catch (error) {
      console.error('Failed to load my posts:', error);
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

  const loadUserLikes = useCallback(async (userUid: string) => {
    try {
      const likedPostIds = await getUserLikedPostIds(userUid);
      setState(prev => ({
        ...prev,
        userLikes: { ...prev.userLikes, [userUid]: likedPostIds },
      }));
    } catch (error) {
      console.error('Failed to load user likes:', error);
    }
  }, []);

  const toggleLike = useCallback(async (postId: string, _authorId: string) => {
    const currentUser = state.currentUser;
    if (!currentUser) return;

    // 낙관적 업데이트 - setState 내에서 최신 상태를 읽어 stale closure 방지
    let isCurrentlyLiked = false;

    setState(prev => {
      const userLikes = { ...prev.userLikes };
      if (!userLikes[currentUser]) userLikes[currentUser] = [];
      const likes = [...userLikes[currentUser]];
      const index = likes.indexOf(postId);
      isCurrentlyLiked = index !== -1;

      if (index === -1) {
        likes.push(postId);
        return {
          ...prev,
          userLikes: { ...userLikes, [currentUser]: likes },
          likedPosts: prev.likedPosts.includes(postId) ? prev.likedPosts : [...prev.likedPosts, postId]
        };
      } else {
        likes.splice(index, 1);
        return { ...prev, userLikes: { ...userLikes, [currentUser]: likes } };
      }
    });

    try {
      if (isCurrentlyLiked) {
        await removeLike(currentUser, postId);
      } else {
        await addLike(currentUser, postId);
      }
    } catch (error) {
      console.error('Failed to update like:', error);
      // 롤백
      loadUserLikes(currentUser);
    }
  }, [state.currentUser, loadUserLikes]);

  const setZoomLevel = useCallback((level: number) => {
    setState(prev => ({
      ...prev,
      zoomLevel: Math.max(10, Math.min(100, level))
    }));
  }, []);

  const login = useCallback(async () => {
    try {
      await supabaseSignInWithGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
    }
  }, []);

  const setUserName = useCallback((name: string) => {
    setState(prev => ({ ...prev, userName: name }));
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabaseSignOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setState(prev => ({
      ...prev,
      currentUser: null,
      userName: null,
      userAvatar: null,
      posts: [],
      isAdmin: false,
    }));
  }, []);

  const setWorldPageOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, worldPageOpen: open }));
  }, []);

  const goToMain = useCallback(() => {
    setState(prev => ({ ...prev, worldPageOpen: false }));
  }, []);

  const addPost = useCallback(async (post: Omit<Post, 'id'> & { mediaFile?: File }) => {
    const currentUser = state.currentUser;
    if (!currentUser) throw new Error('Not logged in');

    try {
      let mediaUrl: string | undefined;
      let mediaType: 'image' | 'video' | undefined;

      if (post.mediaFile) {
        const result = await uploadPostMedia(post.mediaFile, currentUser);
        mediaUrl = result.url;
        mediaType = result.type;
      }

      const supabasePost = await createPostInDb({
        author_id: currentUser,
        content: post.content,
        media_url: mediaUrl,
        media_type: mediaType,
        angle: post.angle,
        radius: post.radius,
        float_offset: post.floatOffset,
        float_delay: post.floatDelay,
      });

      const newPost = supabasePostToPost(supabasePost);
      newPost.authorName = state.userName || 'Anonymous';

      setState(prev => ({ ...prev, posts: [newPost, ...prev.posts] }));
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }, [state.currentUser, state.userName]);

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
      await deletePostFromDb(postId, currentUser);
      setState(prev => ({
        ...prev,
        posts: prev.posts.filter(p => p.id !== postId)
      }));
      return true;
    } catch (error) {
      console.error('Failed to delete post:', error);
      return false;
    }
  }, [state.currentUser]);

  const handleUpdateDisplayName = useCallback(async (name: string) => {
    const currentUser = state.currentUser;
    if (!currentUser || !name.trim()) return;

    try {
      await updateDisplayNameInDb(currentUser, name.trim());
      setUserName(name.trim());
    } catch (error) {
      console.error('Failed to update display name:', error);
    }
  }, [state.currentUser]);

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
    loadMyPosts,
    loadUserLikes,
    updateDisplayName: handleUpdateDisplayName,
  };
}
