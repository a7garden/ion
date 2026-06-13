-- 댓글 시스템 없음
DROP TABLE IF EXISTS public.comments;

-- 팔로잉 시스템 없음
DROP TABLE IF EXISTS public.follows;

-- posts 테이블: bgm 관련 컬럼 제거 (BGM 기능 현재 미사용)
ALTER TABLE public.posts DROP COLUMN IF EXISTS bgm_url;
ALTER TABLE public.posts DROP COLUMN IF EXISTS bgm_name;

-- posts 테이블: 미디어 타입 제약 강화 (image, video만 허용, NULL 가능=텍스트 전용)
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_media_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_media_type_check 
  CHECK (media_type IN ('image', 'video', NULL));

-- profiles: username을 필수가 아닌 옵션으로 유지 (Google 로그인 시 자동 설정)
-- 현재 스키마가 이미 올바름

-- 정리 완료
