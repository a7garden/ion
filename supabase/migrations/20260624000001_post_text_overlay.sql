-- PostCard가 인스타 스토리 콜라주처럼 미디어 위에 텍스트 오버레이를 렌더할 수 있도록 컬럼 추가.
-- 기존 데이터는 NULL로 두어 호환. 새 글 작성 시 textOverlay/textColor 선택.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS text_overlay TEXT
    CHECK (text_overlay IN ('white', 'black', 'color')),
  ADD COLUMN IF NOT EXISTS text_color TEXT;

-- feed_random RPC가 두 컬럼을 같이 반환하도록 갱신.
DROP FUNCTION IF EXISTS public.feed_random(uuid, integer, uuid[]);

CREATE OR REPLACE FUNCTION public.feed_random(
  viewer_id uuid,
  batch_size integer DEFAULT 10,
  exclude_ids uuid[] DEFAULT '{}'::uuid[]
)
RETURNS TABLE(
  id uuid,
  author_id uuid,
  content text,
  media_url text,
  media_type text,
  text_overlay text,
  text_color text,
  created_at timestamp with time zone,
  author_display_name text,
  author_planet text
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT
    p.id,
    p.author_id,
    p.content,
    p.media_url,
    p.media_type,
    p.text_overlay,
    p.text_color,
    p.created_at,
    pr.display_name AS author_display_name,
    pr.planet AS author_planet
  FROM public.posts p
  JOIN public.profiles pr ON pr.id = p.author_id
  WHERE (viewer_id IS NULL OR p.author_id <> viewer_id)
    AND (cardinality(exclude_ids) = 0 OR NOT (p.id = ANY(exclude_ids)))
  ORDER BY random()
  LIMIT GREATEST(1, batch_size);
$function$;

-- 기존 getUserPosts는 profiles JOIN으로 단순 select. 그쪽도 컬럼 노출.
-- (별도 RPC는 아니므로 영향 없음, profiles 컬럼만 사용)
