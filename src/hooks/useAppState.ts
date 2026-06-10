import { useState, useEffect, useCallback } from 'react';
import type { AppState, Post } from '@/types';
import { DEFAULT_STATE, STORAGE_KEY, SAMPLE_AUTHORS, SAMPLE_CONTENTS } from '@/constants';

function loadData(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (e) {
    console.log('LocalStorage unavailable');
  }
  return { ...DEFAULT_STATE };
}

function saveData(data: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.log('LocalStorage unavailable');
  }
}

function generatePosts(): Post[] {
  const shuffledAuthors = [...SAMPLE_AUTHORS].sort(() => Math.random() - 0.5);
  const shuffledContents = [...SAMPLE_CONTENTS].sort(() => Math.random() - 0.5);
  const count = 15;
  const newPosts: Post[] = [];

  for (let i = 0; i < count; i++) {
    newPosts.push({
      id: 'post_' + Math.random().toString(36).substr(2, 9),
      authorId: shuffledAuthors[i % shuffledAuthors.length],
      content: shuffledContents[i % shuffledContents.length],
      angle: Math.random() * 360,
      radius: 0,
      floatOffset: Math.random() * 2 - 1,
      floatDelay: Math.random() * 3
    });
  }
  return newPosts;
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const data = loadData();
    if (data.posts.length === 0) {
      data.posts = generatePosts();
    }
    return data;
  });

  useEffect(() => {
    saveData(state);
  }, [state]);

  const toggleTheme = useCallback(() => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'white' ? 'black' : 'white'
    }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      sidebarOpen: !prev.sidebarOpen
    }));
  }, []);

  const toggleLike = useCallback((postId: string, _authorId: string) => {
    setState(prev => {
      const currentUser = prev.currentUser || 'guest';
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
  }, []);

  const addFriend = useCallback((name: string) => {
    setState(prev => {
      if (!name.trim()) return prev;
      if (prev.friends.some(f => f.name === name.trim())) return prev;
      return {
        ...prev,
        friends: [...prev.friends, { id: Math.random().toString(36).substr(2, 9), name: name.trim() }]
      };
    });
  }, []);

  const deleteFriend = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      friends: prev.friends.filter((_, i) => i !== index)
    }));
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    setState(prev => ({
      ...prev,
      zoomLevel: Math.max(10, Math.min(100, level))
    }));
  }, []);

  const login = useCallback((id: string, pw: string) => {
    if (id === 'admin' && pw === '1234') {
      setState(prev => ({
        ...prev,
        currentUser: 'admin',
        isAdmin: true
      }));
      return { success: true, message: 'Welcome, admin' };
    } else if (id && pw) {
      setState(prev => ({
        ...prev,
        currentUser: id,
        isAdmin: false
      }));
      return { success: true, message: `Welcome, ${id}` };
    }
    return { success: false, message: 'Please enter ID and Password' };
  }, []);

  const logout = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentUser: null,
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
      worldPageOpen: false,
      sidebarOpen: false
    }));
  }, []);

  const addPost = useCallback((post: Omit<Post, 'id'>) => {
    setState(prev => ({
      ...prev,
      posts: [{ ...post, id: 'post_' + Math.random().toString(36).substr(2, 9) }, ...prev.posts]
    }));
  }, []);

  const deletePost = useCallback((postId: string) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.filter(p => p.id !== postId)
    }));
  }, []);

  return {
    state,
    toggleTheme,
    toggleSidebar,
    toggleLike,
    addFriend,
    deleteFriend,
    setZoomLevel,
    login,
    logout,
    setWorldPageOpen,
    goToMain,
    addPost,
    deletePost
  };
}