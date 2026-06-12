import type { NeonPost } from './neon';

function generateMockUsers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    uid: `user_${i + 1}`,
    displayName: `사용자${i + 1}`,
    email: `user${i + 1}@example.com`,
    photoUrl: `https://example.com/photos/${i + 1}.jpg`,
  }));
}

function generateMockPosts(users: ReturnType<typeof generateMockUsers>) {
  const posts: NeonPost[] = [];
  let postIndex = 0;

  users.forEach((user) => {
    for (let i = 1; i <= 10; i++) {
      postIndex++;
      posts.push({
        id: `mock-post-${postIndex}`,
        author_uid: user.uid,
        author_name: user.displayName,
        content: `피드 게시물 #${user.uid}-${i}`,
        media_url: Math.random() > 0.3 ? `https://example.com/media/${user.uid}_${i}.jpg` : null,
        bgm_name: Math.random() > 0.5 ? `BGM Track ${Math.floor(Math.random() * 5) + 1}` : null,
        angle: Math.random() * 360,
        radius: Math.random() * 50,
        float_offset: Math.random() * 10,
        float_delay: Math.random() * 5,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  });

  return posts;
}

export const MOCK_USERS = generateMockUsers(50);
export const MOCK_POSTS = generateMockPosts(MOCK_USERS);

export function getMockPostsByUserUid(_userUid: string, limit: number = 10): NeonPost[] {
  const shuffled = [...MOCK_POSTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

export function getAllMockPosts(limit: number = 100): NeonPost[] {
  return MOCK_POSTS.slice(0, limit);
}
