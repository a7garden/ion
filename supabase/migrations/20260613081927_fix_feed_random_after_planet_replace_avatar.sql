-- feed_random: avatar_url → planet
DROP FUNCTION IF EXISTS public.feed_random(UUID, INT);

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
  author_planet TEXT
) AS $$
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
WHERE p.author_id != viewer_id
ORDER BY RANDOM()
LIMIT batch_size;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- handle_new_user: remove avatar_url reference
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
