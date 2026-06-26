-- feed_random: 최근 글(recency) 가중 노출.
--
-- 배경: ORDER BY random() 균일 샘플링에서는 풀이 크면(현재 ~509건, 대부분 시드)
-- 방금 작성한 글이 거의 뜨지 않는다(새로고침당 노출 확률 ~8%). 실사용자의 새 글이
-- 묻히는 문제를 해결하기 위해, 각 배치의 일부 슬롯을 '최근 글'에 우선 할당한다.
--
-- 동작:
--   1) 후보 풀에서 viewer 자기 글 제외 + exclude_ids(dismiss/이미 보유) 제외 (기존과 동일).
--   2) 최근 글(created_at >= now() - recency_seconds) 중 최대 recent_cap개를 무작위 선택.
--   3) 나머지 슬롯은 비-최근 풀에서 무작위로 채운다 → 발견(discovery) 유지.
--   4) 최근 글이 없거나 부족하면 비-최근 풀로 자동 보충 → 피드가 비지 않음.
--
-- 매개변수(클라이언트는 viewer_id/batch_size/exclude_ids만 전달, 나머지는 기본값):
--   recency_seconds  기본 86400 (24시간)
--   recent_cap       기본 8       (배치당 최근 글 상한 — 발견 비중 보호)
--
-- 드리프트 보정: 20260624000001_post_text_overlay 가 라이브에 누락되어 있을 수 있어
-- text_overlay/text_color 컬럼을 멱등하게 보장한 뒤 함수를 재정의한다.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS text_overlay TEXT
    CHECK (text_overlay IN ('white', 'black', 'color')),
  ADD COLUMN IF NOT EXISTS text_color TEXT;

DROP FUNCTION IF EXISTS public.feed_random(uuid, integer, uuid[]) CASCADE;

CREATE FUNCTION public.feed_random(
  viewer_id uuid DEFAULT NULL,
  batch_size integer DEFAULT 10,
  exclude_ids uuid[] DEFAULT '{}'::uuid[],
  recency_seconds integer DEFAULT 86400,
  recent_cap integer DEFAULT 8
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
STABLE
SECURITY DEFINER
AS $function$
  WITH candidates AS (
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
      pr.planet AS author_planet,
      (p.created_at >= now() - make_interval(secs => GREATEST(0, recency_seconds))) AS is_recent
    FROM public.posts p
    JOIN public.profiles pr ON pr.id = p.author_id
    WHERE (viewer_id IS NULL OR p.author_id <> viewer_id)
      AND (cardinality(exclude_ids) = 0 OR NOT (p.id = ANY(exclude_ids)))
  ),
  recent_pick AS (
    SELECT id, author_id, content, media_url, media_type, text_overlay, text_color,
           created_at, author_display_name, author_planet
    FROM candidates
    WHERE is_recent
    ORDER BY random()
    LIMIT LEAST(GREATEST(0, recent_cap), GREATEST(1, batch_size))
  ),
  fill_pick AS (
    SELECT id, author_id, content, media_url, media_type, text_overlay, text_color,
           created_at, author_display_name, author_planet
    FROM candidates c
    WHERE NOT c.is_recent
      AND c.id NOT IN (SELECT id FROM recent_pick)
    ORDER BY random()
    LIMIT GREATEST(0, GREATEST(1, batch_size) - (SELECT count(*) FROM recent_pick))
  )
  SELECT id, author_id, content, media_url, media_type, text_overlay, text_color,
         created_at, author_display_name, author_planet FROM recent_pick
  UNION ALL
  SELECT id, author_id, content, media_url, media_type, text_overlay, text_color,
         created_at, author_display_name, author_planet FROM fill_pick;
$function$;

COMMENT ON FUNCTION public.feed_random(uuid, integer, uuid[], integer, integer)
  IS '랜덤 피드 + 최근 글(recency) 가중. 최대 recent_cap개의 최근 글(recency_seconds 이내)을 '
     '우선 무작위 선택한 뒤, 나머지를 비-최근 풀에서 무작위로 채운다. viewer_id가 NULL(비로그인)이면 '
     '자기 글 제외를 건너뛴다. exclude_ids는 dismiss/이미 보유 카드 제외용.';

GRANT EXECUTE ON FUNCTION public.feed_random(uuid, integer, uuid[], integer, integer) TO PUBLIC;
