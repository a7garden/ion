import type { Post } from '@/types';
import type { FeedRow } from '@/lib/supabase';

export function toPost(row: FeedRow): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_display_name || 'Anonymous',
    authorPlanet: (row as any).author_planet ?? 'moon',
    content: row.content || '',
    media: row.media_url ?? undefined,
    mediaType: row.media_type ?? undefined,
    createdAt: row.created_at,
  };
}
