-- feed_random: 비로그인(anon) 호출 허용. viewer_id가 NULL이면 자기 글 제외 조건을 건너뛴다.
-- 기존 시그니처 충돌(42725)을 피하기 위해 기존 함수를 DROP 후 재생성.
DROP FUNCTION IF EXISTS public.feed_random(uuid, integer, uuid[]) CASCADE;

CREATE FUNCTION public.feed_random(
  viewer_id uuid DEFAULT NULL,
  batch_size integer DEFAULT 10,
  exclude_ids uuid[] DEFAULT ARRAY[]::uuid[]
)
RETURNS TABLE(
  id uuid,
  author_id uuid,
  content text,
  media_url text,
  media_type text,
  created_at timestamp with time zone,
  author_display_name text,
  author_planet text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $function$
SELECT
  p.id,
  p.author_id,
  p.content,
  p.media_url,
  p.media_type,
  p.created_at,
  pr.display_name AS author_display_name,
  pr.planet AS author_planet
FROM public.posts p
JOIN public.profiles pr ON p.author_id = pr.id
WHERE (viewer_id IS NULL OR p.author_id <> viewer_id)
  AND p.id <> ALL(COALESCE(exclude_ids, ARRAY[]::uuid[]))
ORDER BY RANDOM()
LIMIT batch_size;
$function$;

COMMENT ON FUNCTION public.feed_random(uuid, integer, uuid[]) IS '랜덤 피드. viewer_id가 NULL(비로그인)이면 모든 글 후보. exclude_ids에 포함된 post(id)는 제외 — 세션 내 dismiss/이미 보유 카드 보충용.';

GRANT EXECUTE ON FUNCTION public.feed_random(uuid, integer, uuid[]) TO PUBLIC;
