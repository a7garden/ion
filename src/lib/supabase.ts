import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// Types
// ============================================

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  angle: number;
  radius: number;
  float_offset: number;
  float_delay: number;
  created_at: string;
  // joined
  author_name?: string;
  author_username?: string;
  author_avatar?: string;
  like_count?: number;
}

// ============================================
// Auth
// ============================================

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthChange(
  callback: (user: { id: string; email: string | null; display_name: string | null; avatar_url: string | null } | null) => void
) {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      // 프로필 조회 (트리거로 자동 생성됨)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      callback({
        id: session.user.id,
        email: session.user.email ?? null,
        display_name: profile?.display_name ?? session.user.user_metadata?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? session.user.user_metadata?.avatar_url ?? null,
      });
    } else {
      callback(null);
    }
  });
}

// ============================================
// Profiles
// ============================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateDisplayName(userId: string, displayName: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', userId);

  if (error) throw error;
}

export async function updateUsername(userId: string, username: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', userId);

  if (error) throw error;
}

// ============================================
// Storage (Media Upload)
// ============================================

export async function uploadPostMedia(
  file: File,
  userId: string
): Promise<{ url: string; type: 'image' | 'video' }> {
  const ext = file.name.split('.').pop() || 'bin';
  const type = file.type.startsWith('video/')
    ? 'video' as const
    : 'image' as const;

  const folder = type === 'video' ? 'videos' : 'images';
  const path = `${folder}/${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('post-media')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('post-media')
    .getPublicUrl(path);

  return { url: urlData.publicUrl, type };
}

// ============================================
// Posts
// ============================================

export async function createPost(post: {
  author_id: string;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  angle: number;
  radius?: number;
  float_offset: number;
  float_delay: number;
}): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: post.author_id,
      content: post.content,
      media_url: post.media_url || null,
      media_type: post.media_type || null,
      angle: post.angle,
      radius: post.radius || 0,
      float_offset: post.float_offset,
      float_delay: post.float_delay,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRandomUnviewedPosts(
  userId: string,
  limit: number = 10
): Promise<Post[]> {
  // RPC 함수 사용 (Security Definer)
  const { data, error } = await supabase.rpc('get_random_unviewed_posts', {
    target_user_id: userId,
    result_limit: limit,
  });

  if (error) throw error;
  return data || [];
}

export async function getAllPosts(limit: number = 100): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author_name:profiles!posts_author_id_fkey(display_name),
      author_username:profiles!posts_author_id_fkey(username),
      author_avatar:profiles!posts_author_id_fkey(avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((p: any) => ({
    ...p,
    author_name: p.author_name?.display_name ?? p.profiles?.display_name,
    author_username: p.author_username?.username ?? p.profiles?.username,
    author_avatar: p.author_avatar?.avatar_url ?? p.profiles?.avatar_url,
  }));
}

export async function getUserPosts(userId: string, limit: number = 50): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author_name:profiles!posts_author_id_fkey(display_name),
      author_username:profiles!posts_author_id_fkey(username),
      author_avatar:profiles!posts_author_id_fkey(avatar_url)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((p: any) => ({
    ...p,
    author_name: p.author_name?.display_name ?? p.profiles?.display_name,
    author_username: p.author_username?.username ?? p.profiles?.username,
    author_avatar: p.author_avatar?.avatar_url ?? p.profiles?.avatar_url,
  }));
}

export async function deletePost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', userId);

  if (error) throw error;
  return true;
}

// ============================================
// Likes
// ============================================

export async function addLike(userId: string, postId: string): Promise<void> {
  const { error } = await supabase
    .from('post_likes')
    .insert({ user_id: userId, post_id: postId });

  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function removeLike(userId: string, postId: string): Promise<void> {
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);

  if (error) throw error;
}

export async function getUserLikedPostIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []).map((r: { post_id: string }) => r.post_id);
}

export async function getPostLikeCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) throw error;
  return count ?? 0;
}

// ============================================
// Views (Swipe/Dismiss tracking)
// ============================================

export async function markPostAsViewed(userId: string, postId: string): Promise<void> {
  const { error } = await supabase
    .from('post_views')
    .insert({ user_id: userId, post_id: postId });

  if (error && error.code !== '23505') throw error; // ignore duplicate
}

// ============================================
// Comments — 댓글 시스템 없음
// ============================================
