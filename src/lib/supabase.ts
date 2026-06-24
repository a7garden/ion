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
  planet: string;
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
  author_planet: string;
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

/** Dev-only: email/password login for test accounts */
export function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signOut() {
  return supabase.auth.signOut();
}

export function onAuthStateChange(
  callback: (user: { id: string; display_name: string; planet: string } | null) => void,
) {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) return callback(null);

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, planet')
      .eq('id', session.user.id)
      .single();

    callback({
      id: session.user.id,
      display_name: profile?.display_name ?? session.user.user_metadata?.full_name ?? 'Anonymous',
      planet: profile?.planet ?? 'moon',
    });
  });
}

// ============================================
// Profiles
// ============================================

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, planet, email, created_at')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export function updateDisplayName(userId: string, name: string) {
  return supabase.from('profiles').update({ display_name: name }).eq('id', userId);
}

export function updatePlanet(userId: string, planet: string) {
  return supabase.from('profiles').update({ planet }).eq('id', userId);
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

export async function getFeed(
  viewerId: string,
  batchSize = 10,
  excludeIds: string[] = []
): Promise<FeedRow[]> {
  const { data, error } = await supabase.rpc('feed_random', {
    // 비로그인(anon) 호출 허용 — feed_random은 viewer_id가 NULL이면 자기 글 제외를 건너뛴다.
    viewer_id: viewerId || null,
    batch_size: batchSize,
    exclude_ids: excludeIds,
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
      author_planet:profiles!posts_author_id_fkey(planet)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;

  return (data ?? []).map((p: any) => ({
    ...p,
    author_display_name: p.author_display_name?.display_name ?? p.author_display_name,
    author_planet: p.author_planet?.planet ?? p.author_planet ?? 'moon',
  }));
}

export async function updatePost(postId: string, opts: { content?: string; media_url?: string | null; media_type?: 'image' | 'video' | null }) {
  const { data, error } = await supabase
    .from('posts')
    .update({
      content: opts.content ?? null,
      media_url: opts.media_url ?? null,
      media_type: opts.media_type ?? null,
    })
    .eq('id', postId)
    .select('id, author_id, content, media_url, media_type, created_at')
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(postId: string) {
  const { error } = await supabase.from('posts').delete()
    .eq('id', postId)
    .eq('author_id', (await supabase.auth.getUser()).data.user?.id ?? '');
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

export async function getAllMutualConnections(): Promise<{ user_a: string; user_b: string }[]> {
  const { data, error } = await supabase.rpc('all_mutual_connections');
  if (error) throw error;
  return data ?? [];
}

export async function getMutualConnections(viewerId: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('mutual_connections', { viewer_id: viewerId });
  if (error) throw error;
  // user_a가 항상 viewer, user_b가 상대방
  return (data ?? []).map((r: any) => r.user_b as string);
}

// ============================================
// Blocks
// ============================================

export async function blockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error && error.code !== '23505') throw error;
}

export async function unblockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase.from('blocks').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId);
  if (error) throw error;
}

export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => r.blocked_id as string);
}

// ============================================
// Reports
// ============================================

export async function reportPost(reporterId: string, postId: string, reason: string, detail?: string) {
  const { error } = await supabase.from('reports').insert({
    reporter_id: reporterId,
    post_id: postId,
    reason,
    detail: detail ?? null,
  });
  if (error) throw error;
}

// ============================================
// Account Deletion (회원 탈퇴)
// ============================================

export async function deleteAccount(userId: string) {
  // 1. Delete all storage files for this user (images/* and videos/*)
  const [imageList, videoList] = await Promise.all([
    supabase.storage.from('media').list(`images/${userId}`),
    supabase.storage.from('media').list(`videos/${userId}`),
  ]);

  const paths: string[] = [];
  for (const list of [imageList, videoList]) {
    if (list.data) {
      for (const f of list.data) {
        // Folder entries have no name with extension; skip them
        if (f.name) paths.push(`${list === imageList ? 'images' : 'videos'}/${userId}/${f.name}`);
      }
    }
  }

  if (paths.length > 0) {
    await supabase.storage.from('media').remove(paths);
  }

  // 2. Delete the profile — cascades to posts, likes, resonances, blocks, reports
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (profileError) throw profileError;
}

// ============================================
// Resonances (공명)
// ============================================

export async function getUnseenResonances(userId: string) {
  const { data, error } = await supabase
    .from('resonances')
    .select('id, user_a, user_b, post_a, post_b, seen, created_at')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .eq('seen', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markResonanceSeen(resonanceId: string) {
  const { error } = await supabase.from('resonances').update({ seen: true }).eq('id', resonanceId);
  if (error) throw error;
}

export async function markAllResonancesSeen(userId: string) {
  const { error } = await supabase
    .from('resonances')
    .update({ seen: true })
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .eq('seen', false);
  if (error) throw error;
}

export async function checkAndCreateResonance(userId: string, likedPostId: string) {
  // Get the author of the liked post
  const { data: likedPost } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', likedPostId)
    .single();
  if (!likedPost || likedPost.author_id === userId) return null;

  const otherUserId = likedPost.author_id;

  // Check if the other user already liked one of my posts
  const { data: myPosts } = await supabase
    .from('posts')
    .select('id')
    .eq('author_id', userId)
    .limit(1);
  if (!myPosts || myPosts.length === 0) return null;

  // Check if other user liked any of my posts
  const { data: mutualLike } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', otherUserId)
    .in('post_id', myPosts.map(p => p.id))
    .limit(1);
  if (!mutualLike || mutualLike.length === 0) return null;

  // Check if resonance already exists
  const { data: existing } = await supabase
    .from('resonances')
    .select('id')
    .or(`and(user_a.eq.${userId},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${userId})`)
    .limit(1);
  if (existing && existing.length > 0) return null;

  // Create resonance
  const myPostId = mutualLike[0].post_id;
  const { data: resonance, error } = await supabase
    .from('resonances')
    .insert({
      user_a: userId,
      user_b: otherUserId,
      post_a: myPostId,
      post_b: likedPostId,
    })
    .select('id, user_a, user_b, post_a, post_b, seen, created_at')
    .single();
  if (error) throw error;
  return resonance;
}
