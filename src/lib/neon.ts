import { neon } from '@neondatabase/serverless';

const connectionString = 'postgres://neondb_owner:npg_HmEyPj51Xnzt@ep-dark-dream-ap70s9s6.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connectionString);

export interface NeonUser {
  uid: string;
  display_name: string | null;
  email: string | null;
  photo_url: string | null;
}

export interface NeonPost {
  id: string;
  author_uid: string;
  author_name: string;
  content: string;
  media_url: string | null;
  bgm_name: string | null;
  angle: number;
  radius: number;
  float_offset: number;
  float_delay: number;
  created_at: string;
}

export interface CreatePostInput {
  author_uid: string;
  author_name: string;
  content: string;
  media_url?: string;
  bgm_name?: string;
  angle: number;
  radius?: number;
  float_offset: number;
  float_delay: number;
}

export async function upsertUser(user: NeonUser): Promise<void> {
  await sql`
    INSERT INTO users (uid, display_name, email, photo_url)
    VALUES (${user.uid}, ${user.display_name}, ${user.email}, ${user.photo_url})
    ON CONFLICT (uid) DO UPDATE SET
      display_name = COALESCE(${user.display_name}, users.display_name),
      email = COALESCE(${user.email}, users.email),
      photo_url = COALESCE(${user.photo_url}, users.photo_url),
      updated_at = NOW()
  `;
}

export async function getUserByUid(uid: string): Promise<NeonUser | null> {
  const rows = await sql`SELECT uid, display_name, email, photo_url FROM users WHERE uid = ${uid}` as NeonUser[];
  return rows[0] || null;
}

export async function updateUserDisplayName(uid: string, displayName: string): Promise<void> {
  await sql`UPDATE users SET display_name = ${displayName}, updated_at = NOW() WHERE uid = ${uid}`;
}

export async function createPost(post: CreatePostInput): Promise<NeonPost> {
  const rows = await sql`
    INSERT INTO posts (author_uid, author_name, content, media_url, bgm_name, angle, radius, float_offset, float_delay)
    VALUES (${post.author_uid}, ${post.author_name}, ${post.content}, ${post.media_url || null}, ${post.bgm_name || null}, ${post.angle}, ${post.radius || 0}, ${post.float_offset}, ${post.float_delay})
    RETURNING id, author_uid, author_name, content, media_url, bgm_name, angle, radius, float_offset, float_delay, created_at
  ` as NeonPost[];
  return rows[0];
}

export async function getRandomPosts(userUid: string, limit: number): Promise<NeonPost[]> {
  return await sql`
    SELECT p.id, p.author_uid, p.author_name, p.content, p.media_url, p.bgm_name, p.angle, p.radius, p.float_offset, p.float_delay, p.created_at
    FROM posts p
    WHERE p.id NOT IN (
      SELECT post_id FROM user_viewed_posts WHERE user_uid = ${userUid}
    )
    ORDER BY RANDOM()
    LIMIT ${limit}
  ` as NeonPost[];
}

export async function getAllPosts(limit: number = 100): Promise<NeonPost[]> {
  return await sql`
    SELECT id, author_uid, author_name, content, media_url, bgm_name, angle, radius, float_offset, float_delay, created_at
    FROM posts
    ORDER BY created_at DESC
    LIMIT ${limit}
  ` as NeonPost[];
}

export async function deletePost(postId: string, authorUid: string): Promise<boolean> {
  const rows = await sql`DELETE FROM posts WHERE id = ${postId} AND author_uid = ${authorUid} RETURNING id` as { id: string }[];
  return rows.length > 0;
}

export async function markPostAsViewed(userUid: string, postId: string): Promise<void> {
  await sql`INSERT INTO user_viewed_posts (user_uid, post_id) VALUES (${userUid}, ${postId}) ON CONFLICT (user_uid, post_id) DO NOTHING`;
}

export async function getViewedPostIds(userUid: string): Promise<string[]> {
  const rows = await sql`SELECT post_id FROM user_viewed_posts WHERE user_uid = ${userUid}` as { post_id: string }[];
  return rows.map(r => r.post_id);
}

export async function addLike(userUid: string, postId: string): Promise<void> {
  await sql`INSERT INTO user_likes (user_uid, post_id) VALUES (${userUid}, ${postId}) ON CONFLICT (user_uid, post_id) DO NOTHING`;
}

export async function removeLike(userUid: string, postId: string): Promise<void> {
  await sql`DELETE FROM user_likes WHERE user_uid = ${userUid} AND post_id = ${postId}`;
}

export async function getPostLikeCount(postId: string): Promise<number> {
  const rows = await sql`SELECT COUNT(*) as count FROM user_likes WHERE post_id = ${postId}` as { count: string }[];
  return parseInt(rows[0]?.count || '0', 10);
}

export async function getUserLikedPostIds(userUid: string): Promise<string[]> {
  const rows = await sql`SELECT post_id FROM user_likes WHERE user_uid = ${userUid}` as { post_id: string }[];
  return rows.map(r => r.post_id);
}

export async function getMutualLikeUsers(userUid: string): Promise<string[]> {
  const rows = await sql`
    SELECT DISTINCT u.uid
    FROM users u
    WHERE u.uid != ${userUid}
    AND EXISTS (
      SELECT 1 FROM user_likes ul1
      JOIN user_likes ul2 ON ul1.post_id = ul2.post_id
      WHERE ul1.user_uid = ${userUid} AND ul2.user_uid = u.uid
    )
  ` as { uid: string }[];
  return rows.map(r => r.uid);
}

export async function getUserPostLikes(postAuthorUid: string): Promise<{ user_uid: string; post_id: string }[]> {
  const rows = await sql`
    SELECT ul.user_uid, ul.post_id
    FROM user_likes ul
    JOIN posts p ON ul.post_id = p.id
    WHERE p.author_uid = ${postAuthorUid}
  ` as { user_uid: string; post_id: string }[];
  return rows;
}