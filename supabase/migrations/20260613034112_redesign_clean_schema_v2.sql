-- ============================================
-- ion v2: 완전 재설계
-- 수치 없는 SNS. 연결만 남는다.
-- ============================================

-- 기존 테이블 모두 삭제
DROP TABLE IF EXISTS public.post_views CASCADE;
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.get_random_unviewed_posts(UUID, INT) CASCADE;

-- ============================================
-- 1. profiles
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- auth.users 생성 시 자동 profiles 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. posts
-- ============================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);

-- media_url이 있으면 media_type도 필수
ALTER TABLE public.posts ADD CONSTRAINT media_requires_type
  CHECK (
    (media_url IS NULL AND media_type IS NULL) OR
    (media_url IS NOT NULL AND media_type IS NOT NULL)
  );

-- ============================================
-- 3. likes
-- ============================================
CREATE TABLE public.likes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_likes_post ON public.likes(post_id);
CREATE INDEX idx_likes_user ON public.likes(user_id);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: anyone can read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles: update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "posts: anyone can read" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts: create own" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts: delete own" ON public.posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "likes: anyone can read" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes: insert own" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes: delete own" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 함수: 랜덤 피드 (이미 본 것 제외, author 정보 포함)
-- ============================================
CREATE OR REPLACE FUNCTION public.feed_random(
  viewer_id UUID,
  batch_size INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  created_at TIMESTAMPTZ,
  author_display_name TEXT,
  author_avatar_url TEXT
) AS $$
SELECT
  p.id,
  p.author_id,
  p.content,
  p.media_url,
  p.media_type,
  p.created_at,
  pr.display_name AS author_display_name,
  pr.avatar_url AS author_avatar_url
FROM public.posts p
JOIN public.profiles pr ON p.author_id = pr.id
WHERE p.author_id != viewer_id
ORDER BY RANDOM()
LIMIT batch_size;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- 함수: 상호 좋아요 연결 (World 그래프)
-- ============================================
CREATE OR REPLACE FUNCTION public.mutual_connections(
  viewer_id UUID
)
RETURNS TABLE (
  user_a UUID,
  user_b UUID
) AS $$
SELECT DISTINCT
  l1.user_id AS user_a,
  l2.user_id AS user_b
FROM public.likes l1
JOIN public.likes l2 ON l1.post_id = l2.post_id
WHERE l1.user_id = viewer_id
  AND l2.user_id != viewer_id
  AND EXISTS (
    SELECT 1 FROM public.likes l3
    JOIN public.likes l4 ON l3.post_id = l4.post_id
    WHERE l3.user_id = l2.user_id
      AND l4.user_id = l1.user_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- Storage
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Media files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;

CREATE POLICY "media: public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media: auth upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'media' AND auth.role() = 'authenticated'
);
CREATE POLICY "media: delete own" ON storage.objects FOR DELETE USING (
  bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]
);
