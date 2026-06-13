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
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
}

export interface FeedRow {
  id: string;
  author_id: string;
  content: string;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  created_at: string;
  author_display_name: string;
  author_avatar_url: string | null;
}

// ============================================
// Auth
// ============================================

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

export function signOut() {
  return supabase.auth.signOut();
}

export function onAuthStateChange(
  callback: (user: { id: string; display_name: string; avatar_url: string | null } | null) => void,
) {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) return callback(null);

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', session.user.id)
      .single();

    callback({
      id: session.user.id,
      display_name: profile?.display_name ?? session.user.user_metadata?.full_name ?? 'Anonymous',
      avatar_url: profile?.avatar_url ?? session.user.user_metadata?.avatar_url ?? null,
    });
  });
}

// ============================================
// Profiles
// ============================================

export function updateDisplayName(userId: string, name: string) {
  return supabase.from('profiles').update({ display_name: name }).eq('id', userId);
}

// ============================================
// Storage
// ============================================

export async function uploadMedia(
  file: File,
  userId: string,
): Promise<{ url: string; type: 'image' | 'video' }> {
  const type: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${type}s/${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('media').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return { url: data.publicUrl, type };
}

// ============================================
// Posts
// ============================================

export async function createPost(opts: {
  author_id: string;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video';
}) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: opts.author_id,
      content: opts.content,
      media_url: opts.media_url ?? null,
      media_type: opts.media_type ?? null,
    })
    .select('id, author_id, content, media_url, media_type, created_at')
    .single();
  if (error) throw error;
  return data;
}

export async function getFeed(viewerId: string, batchSize = 10): Promise<FeedRow[]> {
  const { data, error } = await supabase.rpc('feed_random', {
    viewer_id: viewerId,
    batch_size: batchSize,
  });
  if (error) throw error;
  return data ?? [];
}

export async function getUserPosts(userId: string): Promise<FeedRow[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, author_id, content, media_url, media_type, created_at,
      author_display_name:profiles!posts_author_id_fkey(display_name),
      author_avatar_url:profiles!posts_author_id_fkey(avatar_url)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;

  return (data ?? []).map((p: any) => ({
    ...p,
    author_display_name: p.author_display_name?.display_name ?? p.author_display_name,
    author_avatar_url: p.author_avatar_url?.avatar_url ?? p.author_avatar_url,
  }));
}

export async function deletePost(postId: string) {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

// ============================================
// Likes
// ============================================

export async function likePost(userId: string, postId: string) {
  const { error } = await supabase.from('likes').insert({ user_id: userId, post_id: postId });
  if (error && error.code !== '23505') throw error;
}

export async function unlikePost(userId: string, postId: string) {
  const { error } = await supabase.from('likes').delete().eq('user_id', userId).eq('post_id', postId);
  if (error) throw error;
}

export async function getMyLikedPostIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('likes').select('post_id').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => r.post_id as string);
}

// ============================================
// World — 상호 연결
// ============================================

export async function getMutualConnections(viewerId: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('mutual_connections', { viewer_id: viewerId });
  if (error) throw error;
  // user_a가 항상 viewer, user_b가 상대방
  return (data ?? []).map((r: any) => r.user_b as string);
}
