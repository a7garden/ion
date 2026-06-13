-- 기존 함수를 삭제하고 author 정보를 포함하는 새 함수로 교체
DROP FUNCTION IF EXISTS public.get_random_unviewed_posts(UUID, INT);

-- author 정보를 조인해서 반환하는 버전
CREATE OR REPLACE FUNCTION public.get_random_unviewed_posts(
  target_user_id UUID,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  bgm_url TEXT,
  bgm_name TEXT,
  angle DOUBLE PRECISION,
  radius DOUBLE PRECISION,
  float_offset DOUBLE PRECISION,
  float_delay DOUBLE PRECISION,
  created_at TIMESTAMPTZ,
  author_name TEXT,
  author_username TEXT,
  author_avatar TEXT,
  like_count BIGINT
) AS $$
SELECT
  p.id,
  p.author_id,
  p.content,
  p.media_url,
  p.media_type,
  p.bgm_url,
  p.bgm_name,
  p.angle,
  p.radius,
  p.float_offset,
  p.float_delay,
  p.created_at,
  pr.display_name AS author_name,
  pr.username AS author_username,
  pr.avatar_url AS author_avatar,
  COALESCE(lc.cnt, 0) AS like_count
FROM public.posts p
JOIN public.profiles pr ON p.author_id = pr.id
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS cnt FROM public.post_likes WHERE post_id = p.id
) lc ON true
WHERE p.author_id != target_user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.post_views pv
    WHERE pv.post_id = p.id AND pv.user_id = target_user_id
  )
ORDER BY RANDOM()
LIMIT result_limit;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
