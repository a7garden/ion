import type { Post } from '@/types';
import type { PlanetKey } from '@/constants/planets';
import type { FeedRow } from '@/lib/supabase';

export function toPost(row: FeedRow): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_display_name || 'Anonymous',
    authorPlanet: (row.author_planet ?? 'moon') as PlanetKey,
    content: row.content || '',
    media: row.media_url ?? undefined,
    mediaType: row.media_type ?? undefined,
    textOverlay: row.text_overlay ?? undefined,
    textColor: row.text_color ?? undefined,
    createdAt: row.created_at,
  };
}
